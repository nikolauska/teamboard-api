'use strict';

var jwt    = require('jsonwebtoken');
var utils  = require('../../utils');
var config = require('../index');

var User           = require('mongoose').model('user');
var Session        = require('mongoose').model('session');
var BearerStrategy = require('passport-http-bearer').Strategy;

/**
 * Authenticate the requestee as a 'user' based on the passed 'Bearer' token.
 */
module.exports = new BearerStrategy(function(token, done) {

	Session.findOne({token: token}, function(err, session) {

		if(err) {
			return done(utils.error(500, err));
		}

		if(!session) {
			return done(null, null, 'Session not valid');
		}

		User.findOne({ '_id': session.user }, function(err, user) {
			if(err) {
				return done(utils.error(500, err));
			}

			if(!user) {
				return done(null, null, 'User not found');
			}

			jwt.verify(token, config.token.secret, function(err, decoded) {
				if(err) {
					return done(null, null, err);
				}

				return done(null, {
					id:        user.id,
					type:      user.account_type,
					username:  user.name,
					provider:  user.providers,
					boards:    user.boards,
					edited_at: user.edited_at
				});
			});
		});

	});
});
