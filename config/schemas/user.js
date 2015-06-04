'use strict';

var bcrypt   = require('bcrypt');
var mongoose = require('mongoose');

var utils = require('../../utils');





/**
 * Schema defining the 'user' model. Note that there is no model for 'guest'.
 */
var UserSchema = module.exports = new mongoose.Schema({

	/**
	 * User type. Either temporary (guest) or standard (authenticated with a provider).
	 */
	usertype: {
		type:     String,
		enum:     ['temporary', 'standard'],
		required: true,
		default:  'temporary'
	},

	/**
	 * Nickname of the user.
	 */
	name: {
		type:     String,
		required: true
	},


	/**
	 * User's different possible authentication providers
	 */
	providers: {
		basic:  {
			email: {
				type:   String,
				unique: true,
				match:  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
			},

			password: {
				type: String
				//required: true
			}
		},
		github: {
			name:     String,
			email:    String,
			avatar:   String
		}
	},

	/**
	 * Array of different device sessions of the user.
	 */
	sessions:[{
		user_agent:  String,
		token:       String
	}],

	/**
	 * The 'access-token' of the user. In a sense, it indicates whether there
	 * is a valid session available.
	 */
	token: {
		type: String
	},

	/**
	 * Timestamp for the user creation date
	 */
	created_at: {
		type:    Date
	},

	/**
	 * Timestamp for the last time the user was edited
	 */
	edited_at: {
		type:    Date
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
 * Validates password with regexp.
 * Reference: https://kb.wisc.edu/page.php?id=4073
 */
UserSchema.path('providers.basic.password').validate(function() {
	var user = this;

	if(!user.isModified('providers.basic.password')) {
		return true;
	}

	return /^[a-zA-Z0-9!"#$%&'()*+,-.\/:;<=>?@\[\]^_`{|}~]{8,36}$/.test(user.providers.basic.password);
}, null);

/**
 * Hash the users password using 'bcrypt' if modified.
 */
UserSchema.pre('save', function hashPassword(next) {
	var user = this;

	user.edited_at = Date.now();

	if(!user.isModified('providers.basic.password')) {
		return next();
	}

	var SALT_FACTOR = 10;

	bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
		if(err) {
			return next(utils.error(500, err));
		}

		bcrypt.hash(user.providers.basic.password, salt, function(err, hash) {
			if(err) {
				return next(utils.error(500, err));
			}

			user.providers.basic.password = hash;
			return next();
		});
	});
});

/**
 * Compare the given plaintext password with the stored (hashed) password.
 */
UserSchema.methods.comparePassword = function(password, callback) {
	bcrypt.compare(password, this.providers.basic.password, callback);
}
