'use strict';


var utils  = require('../../utils');
var config = require('../index');

var request  = require('request');
var mongoose = require('mongoose');

// url used to access hash/crypt service
var cryptourl = config.crypto.url + ':' + config.crypto.port;

/**
 * @class      User
 * @classdesc  Mongoose model 'user'.
 *
 * @param  {object}  user           user initialization object containing the
 *                                  required fields.
 * @param  {string}  user.email     unique email address.
 * @param  {string}  user.password  a secure password.
 */
var UserSchema = module.exports = new mongoose.Schema({

	/**
	 * Email address unique to this User.
	 *
	 * @name  User#email
	 * @type  {string}
	 */
	email: {
		type:     String,
		match:    /\S+@\S+\.\S+/,
		unique:   true,
		required: true
	},

	/**
	 * Hopefully a very strong password!
	 *
	 * @name  User#password
	 * @type  {string}
	 */
	password: { type: String, required: true },

	/**
	 * JWT Bearer token.
	 *
	 * @name  User#token
	 * @type  {string}
	 */
	token: { type: String }
});

// setup transformations
if(!UserSchema.options.toJSON) UserSchema.options.toJSON = {};
if(!UserSchema.options.toObject) UserSchema.options.toObject = {};

// toJSON transformation
UserSchema.options.toJSON.transform = function(doc, ret) {

	// set the id attribute
	ret.id = doc.id;

	// remove internal attributes
	delete ret._id;
	delete ret.__v;

	// delete sensitive information
	delete ret.password;
	delete ret.token;
}

// toObject transformation is the same as toJSON
UserSchema.options.toObject.transform = UserSchema.options.toJSON.transform;

// check for duplicates
UserSchema.pre('save', function(next) {
	if(!this.isNew) {
		return next();
	}

	mongoose.model('user').count({ email: this.email }, function(err, count) {
		if(err) {
			return next(err);
		}
		if(count > 0) {
			return next(new Error('Duplicate Email'));
		}
		return next();
	});
});

// only save the hash of user's password...
UserSchema.pre('save', function(next) {
	var user = this;

	if(!user.isModified('password')) {
		return next();
	}

	var opts = {
		url: cryptourl + '/hash',
		json: {
			plain: this.password
		}
	}
	var hash = function(tries) {
		return request.post(opts, function(err, res, body) {
			if(err) {
				console.log('hash', err);
				tries = tries - 1;
				if(tries > 0) {
					console.log('hash: retrying...');
					hash(tries);
				}
				else {
					console.log('hash: max retries exceeded...');
					next(utils.error(503, 'Login service down'));
				}
			}
			else {
				if(tries < 5) {
					console.log('hash: succeeded');
				}
				user.password = body.hash;
				return next();
			}
		});
	}
	return hash(5);
});

/**
 * Compares given password to the user's hashed password.
 *
 * @param  {string}    password  given password
 * @param  {function}  callback  invoked on completion
 */
UserSchema.methods.comparePassword = function(password, callback) {
	var opts = {
		url: cryptourl + '/compare',
		json: {
			hash:  this.password,
			plain: password
		}
	}
	var compare = function(tries) {
		return request.post(opts, function(err, res, body) {
			if(err) {
				console.log('compare:', err);
				tries = tries - 1;
				if(tries > 0) {
					console.log('compare: retrying...');
					compare(tries);
				}
				else {
					console.log('compare: max retries exceeded...');
					callback(utils.error(503, 'Login service down'));
				}
			}
			else {
				if(tries < 5) {
					console.log('compare: succeeded');
				}
				callback(null, body.match);
			}
		});
	}
	return compare(5);
}
