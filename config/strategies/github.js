'use strict';

var GithubStrategy = require('passport-http-github').Strategy;

var options = {
	clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8000/auth/github/callback"
}

module.exports = new GitHub.Strategy(options, function(at, rt, profile, done) {
        // Strategies for different providers should always return a set format of
        // the user's profile. This profile will then be added...
        var user = {
                name:   profile.username,
                avatar: profile._json.avatar_url
        }
        return done(null, user);
}));

