'use strict';

var utils = require('../../utils');

var User          = require('mongoose').model('user');
var BasicStrategy =	require('passport-http').BasicStrategy;
//var BasicStrategy = require('passport-local').Strategy;

// Defines the 'req.body' fields used to look for credentials.
var opts = {
	usernameField: 'email',
	passwordField: 'password'
}

/**
 * Authenticate the requestee as a 'user' based on the passed in credentials.
 */
module.exports = new BasicStrategy(opts, function(email, password, done) {
	User.findOne({ 'providers.basic.email': email }, function(err, user) {
		if(err) {
			return done(utils.error(500, err));
		}

		if(!user) {
			return done(null, null, 'User not found');
		}

		user.comparePassword(password, function(err, match) {
			if(err) {
				return done(utils.error(500, err));
			}

			if(!match) {
				return done(null, null, 'Invalid password');
			}
			return done(null, {
				id:       user.id,
				type:     'user',
				username: user.name
			});
		});
	});
});
