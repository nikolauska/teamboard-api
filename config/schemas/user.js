'use strict';

var bcrypt   = require('bcrypt');
var mongoose = require('mongoose');

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
	bcrypt.genSalt(10, function(err, salt) {
		if(err) {
			return next(err);
		}
		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) {
				return next(err);
			}
			user.password = hash;
			return next();
		});
	});
});

/**
 * Compares given password to the user's hashed password.
 *
 * @param  {string}    password  given password
 * @param  {function}  callback  invoked on completion
 */
UserSchema.methods.comparePassword = function(password, callback) {
	bcrypt.compare(password, this.password, function(err, match) {
		if(err) {
			return callback(err);
		}
		return callback(null, match);
	});
}
