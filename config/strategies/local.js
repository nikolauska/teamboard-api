'use strict';


var utils         = require('../../utils');
var LocalStrategy = require('passport-local').Strategy;

var options = {
	usernameField: 'email',
	passwordField: 'password'
}

module.exports = new LocalStrategy(options, function(email, password, done) {
	var User  = require('mongoose').model('user');
	User.findOne({ email: email }, function(err, user) {
		if(err) {
			return done(err);
		}
		if(!user) {
			return done(utils.error(401, 'User not found'));
		}
		user.comparePassword(password, function(err, isMatch) {
			if(err) {
				return done(err);
			}
			if(!isMatch) {
				return done(utils.error(401, 'Invalid password'));
			}
			return done(null, user);
		});
	});
});
