'use strict';

var utils    = require('../../utils');
var config   = require('../index');
var request  = require('request');
var mongoose = require('mongoose');

var UserSchema = module.exports = new mongoose.Schema({
	email: {
		type:     String,
		match:    /\S+@\S+\.\S+/,
		unique:   true,
		required: true
	},
	password: {
		type:     String,
		required: true
	},
	token: {
		type: String
	}
});

if(!UserSchema.options.toJSON) UserSchema.options.toJSON     = { }
if(!UserSchema.options.toObject) UserSchema.options.toObject = { }

UserSchema.options.toJSON.transform = function(doc, ret) {
	ret.id = doc.id;

	delete ret._id;
	delete ret.__v;
	delete ret.token;
	delete ret.password;
}

UserSchema.options.toObject.transform = UserSchema.options.toJSON.transform;

UserSchema.pre('save', function hashPassword(next) {
	if(!this.isModified('password')) {
		return next();
	}
	var opts = {
		url: config.crypto.url + ':' + config.crypto.port + '/hash',
		json: {
			plain: this.password
		}
	}
	var user = this;
	return request.post(opts, function(err, res, body) {
		if(err) {
			return next(utils.error(503, 'Login service down'));
		}
		user.password = body.hash;
		return next();
	});
});

UserSchema.methods.comparePassword = function(password, callback) {
	var opts = {
		url: config.crypto.url + ':' + config.crypto.port + '/compare',
		json: {
			hash:  this.password,
			plain: password
		}
	}
	return request.post(opts, function(err, res, body) {
		if(err) {
			return callback(utils.error(503, 'Login service down'));
		}
		return callback(null, body.match);
	});
}
