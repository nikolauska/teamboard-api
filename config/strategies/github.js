'use strict';

var utils = require('../../utils');

var User           =    require('mongoose').model('user');
var GitHubStrategy = require('passport-github').Strategy;

var options = {
	clientID: '4091c94abf2d7db856c3',
    clientSecret: '41d9babec7bab84964cdea6c7784f8434b14d1d8',
    callbackURL: "http://localhost:9002/api/auth/github/callback",
    scope: 'user'
}

module.exports = new GitHubStrategy(options, function(accessToken, refreshToken, profile, done) {
        // Strategies for different providers should always return a set format of
        // the user's profile. This profile will then be added...
        process.nextTick(function() {
            // try to find the user based on their google id
            User.findOne({ 'providers.github.id' : profile.id }, function(err, user) {
                if (err){
                    return done(err);
                }
                if (user) {
                    console.log(profile);
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    console.log(profile);
                    // There is no email since it can only be accessed if user has made it public
                    new User({ 
                        name: profile.username,
                        account_type: 'standard',
                        providers: {
                            github: {
                                    id: profile.id,
                                    token: accessToken,
                                    name: profile.username,
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

