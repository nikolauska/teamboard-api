'use strict';

var utils = require('../../utils');
var config = require('../index');

var User           =    require('mongoose').model('user');
var GoogleStrategy =	require('passport-google-oauth2').Strategy;

var opts = {
	clientID: config.providers.google.clientID,
	clientSecret: config.providers.google.clientSecret,
    callbackURL: config.providers.google.callbackURL,
    scope: [ 'https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read' ]
}

/**
 * Authenticate the requestee as a 'user' based on the passed in credentials.
 */
module.exports = new GoogleStrategy(opts, function(request, accessToken, refreshToken, profile, done) {
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {
            // try to find the user based on their google id
            User.findOne({ 'providers.google.id' : profile.id }, function(err, user) {
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
						providers: {
							google: {
									id: profile.id,
									token: accessToken,
									name: profile.displayName,
									email: profile.emails[0].value,
									avatar: profile.photos[0].value
							       }
					   },
						created_at: new Date()})
							.save(function(err, user) {
								if(err) {
									if(err.name == 'ValidationError') {
										 throw err;
									}
									throw err;
								}
								return done(null, user);
							});
	                	}
	            	});
	        	});
			});
