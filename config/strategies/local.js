'use strict';


var LocalStrategy = require('passport-local').Strategy;

var options = {
	usernameField: 'email',
	passwordField: 'password'
}

module.exports = new LocalStrategy(options, function(email, password, done) {

	var User  = require('mongoose').model('user');
	var utils = require('../../utils');

	User.find({ email: email }, utils.err(done, function(users) {

		var user = users[0];

		if(!user) {
			return done(new Error('User not found'));
		}

		user.comparePassword(password, function(err, isMatch) {

			if(err) {
				return done(err);
			}

			if(!isMatch) {
				return done(new Error('Invalid password'));
			}

			return done(null, user);
		});
	}));
});
