'use strict';

var utils = require('../../utils');

var User           =    require('mongoose').model('user');
var GoogleStrategy =	require('passport-google').Strategy;

// Defines the 'req.body' fields used to look for credentials.
var opts = {
	client_id: '161571982407-o698t9ofu4nl56efcu3dkl2f2nftb5du.apps.googleusercontent.com',
	client_secret: 'Dd0Me0lL3HT4k8vCdMfvBXBa',
    returnURL: 'http://localhost:9002/api/auth/login/callback',
    realm: 'http://localhost:9002/',
    token: 'asd'
}

/**
 * Authenticate the requestee as a 'user' based on the passed in credentials.
 */
module.exports = new GoogleStrategy(opts, function(accestoken, profile, done) {
	User.findOne({ 'providers.basic.email': email }, function(err, user, res) {
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
		//return res.redirect('/auth/:provider/callback');
	});
});
