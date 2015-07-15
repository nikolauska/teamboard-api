'use strict';

var utils = require('../../utils');
var config = require('../index');

var User             = require('mongoose').model('user');
var FacebookStrategy = require('passport-facebook').Strategy;

var options = {
	clientID: config.providers.facebook.clientID,
	clientSecret: config.providers.facebook.clientSecret,
	callbackURL: config.providers.facebook.callbackURL,
	profileFields: ['id', 'displayName', 'photos', 'email']
}

/**
 * Authenticate the requestee as a 'user' based on the passed in credentials.
 */
module.exports = new FacebookStrategy(options, function(accessToken, refreshToken, profile, done) {
	// User.findOne won't fire until we have all our data back from Facebook
	process.nextTick(function() {
		// try to find the user based on their facebook id
		User.findOne({ 'providers.facebook.id' : profile.id }, function(err, user) {
			if (err){
				return done(err);
			}
			if (user) {
				// if a user is found, log them in
				return done(null, user);
			} else {
				new User({ 
					name: profile.displayName,
					account_type: 'standard',
					avatar: profile.photos[0].value,
					providers: {
						facebook: {
							id: profile.id,
							token: accessToken,
							name: profile.displayName
						}
					},
					created_at: new Date()
				}).save(function(err, user, next) {
							if(err) {
								if(err.name == 'ValidationError') {
									return next(utils.error(500, err));
								}
								return next(utils.error(500, err));
							}
							return done(null, user);
						});
					}
				});
			});
		});
