'use strict';

var utils = require('../../utils');
var config = require('../index');

var User = require('mongoose').model('user');
var GitHubStrategy = require('passport-github').Strategy;

var options = {
    clientID: config.providers.github.clientID,
    clientSecret: config.providers.github.clientSecret,
    callbackURL: config.providers.github.callbackURL,
    scope: 'user'
}

module.exports = new GitHubStrategy(options, function(accessToken, refreshToken, profile, done) {
    // Strategies for different providers should always return a set format of
    // the user's profile. This profile will then be added...
    process.nextTick(function() {
        // try to find the user based on their google id
        User.findOne({
            'providers.github.id': profile.id
        }, function(err, user) {
            if (err) {
                return done(err);
            }
            if (user) {
                // if a user is found, log them in
                return done(null, user);
            } else {
                // Email isn't saved since it can only be accessed if user has made it public
                new User({
                        name: profile.username,
                        account_type: 'standard',
                        providers: {
                            github: {
                                id: profile.id,
                                token: accessToken,
                                name: profile.username,
                                avatar: profile.avatar_url
                            }
                        },
                        created_at: new Date()
                    })
                    .save(function(err, user) {
                        if (err) {
                            if (err.name == 'ValidationError') {
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
