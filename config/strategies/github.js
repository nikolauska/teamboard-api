'use strict';

var utils = require('../../utils');

var User           =    require('mongoose').model('user');
var GitHubStrategy = require('passport-github').Strategy;

var options = {
	clientID: '4091c94abf2d7db856c3',
    clientSecret: '41d9babec7bab84964cdea6c7784f8434b14d1d8',
    callbackURL: "http://localhost:9002/api/auth/github/callback"
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
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    console.log(profile);
                    new User({ 
                        name: profile.displayName,
                        account_type: 'standard',
                        providers: {
                            github: {
                                    id: profile.id,
                                    token: accessToken,
                                    name: profile.displayName,
                                    email: profile.email
                                   }
                       },
                        created_at: new Date()})
                            .save(function(err, user) {
                                if(err) {
                                    if(err.name == 'ValidationError') {
                                        return next(utils.error(400, err));
                                    }
                                    return next(utils.error(500, err));
                                }
                                return done(null, user);
                            });
                        }
                    });
                });
            });

