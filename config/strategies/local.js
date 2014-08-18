'use strict';

var utils = require('../../utils');

var User          = require('mongoose').model('user');
var LocalStrategy = require('passport-local').Strategy;

var options = {
	usernameField: 'email',
	passwordField: 'password'
}

module.exports = new LocalStrategy(options, function(email, password, done) {
	User.findOne({ email: email }, function(err, user) {
		if(err) {
			return done(utils.error(500, err));
		}
		if(!user) {
			return done(utils.error(401, 'User not found'));
		}
		user.comparePassword(password, function(err, match) {
			if(err) {
				return done(err);
			}
			if(!match) {
				return done(utils.error(401, 'Invalid password'));
			}
			return done(null, user);
		});
	});
});
