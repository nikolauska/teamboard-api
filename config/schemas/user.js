'use strict';

var bcrypt   = require('bcrypt');
var mongoose = require('mongoose');

var utils = require('../../utils');

/**
 * Schema defining the 'user' model. Note that there is no model for 'guest'.
 */
var UserSchema = module.exports = new mongoose.Schema({

	/**
	 * The email of the user. Basically the 'username' equivalent.
	 *
	 * TODO Improve validation.
	 */
	email: {
		type:     String,
		match:    /\S+@\S+\.\S+/,
		unique:   true,
		required: true
	},

	/**
	 * The password of the user.
	 */
	password: {
		type:     String,
		required: true
	},

	/**
	 * The 'access-token' of the user. In a sense, it indicates whether there
	 * is a valid session available.
	 */
	token: {
		type: String
	}
});

if(!UserSchema.options.toJSON) UserSchema.options.toJSON     = { }
if(!UserSchema.options.toObject) UserSchema.options.toObject = { }

// Remove the sensitive stuff from 'user' when JSONized.
UserSchema.options.toJSON.transform = function(doc, ret) {
	// ret.id       = doc.id;
	// ret.type     = 'user';
	// ret.username = doc.email;

	// delete ret._id;
	// delete ret.__v;
	// delete ret.token;
	// delete ret.password;

	return {
		'id':       doc.id,
		'type':     'user',
		'username': doc.email
	}
}

/**
 * BUG See 'config/schemas/board.js' for details.
 */
UserSchema.options.toObject.transform = UserSchema.options.toJSON.transform;

/**
 * Hash the users password using 'bcrypt' if modified.
 */
UserSchema.pre('save', function hashPassword(next) {
	var user = this;

	if(!user.isModified('password')) {
		return next();
	}

	var SALT_FACTOR = 10;

	bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
		if(err) {
			return next(utils.error(500, err));
		}

		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) {
				return next(utils.error(500, err));
			}

			user.password = hash;
			return next();
		});
	});
});

/**
 * Compare the given plaintext password with the stored (hashed) password.
 */
UserSchema.methods.comparePassword = function(password, callback) {
	bcrypt.compare(password, this.password, callback);
}
