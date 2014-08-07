'use strict';


var BearerStrategy = require('passport-http-bearer').Strategy;

module.exports = new BearerStrategy(function(token, done) {

	var User  = require('mongoose').model('user');
	var utils = require('../../utils');

	User.find({ token: token }, utils.err(done, function(users) {

		var user = users[0];

		if(!user) {
			return done(utils.error(401, 'User not found'));
		}

		var jwt    = require('jsonwebtoken');
		var config = require('../index');

		jwt.verify(user.token, config.token.secret, function(err) {
			if(err) {
				return done(utils.error(401, err));
			}
			return done(null, user);
		});
	}));
});
