'use strict';

var jwt    = require('jsonwebtoken');
var utils  = require('../../utils');
var config = require('../index');

var User           = require('mongoose').model('user');
var BearerStrategy = require('passport-http-bearer').Strategy;

module.exports = new BearerStrategy(function(token, done) {
	User.findOne({ token: token }, function(err, user) {
		if(err) {
			return done(utils.error(500, err));
		}
		if(!user) {
			return done(utils.error(401, 'User not found'));
		}
		jwt.verify(user.token, config.token.secret, function(err) {
			if(err) {
				return done(utils.error(401, err));
			}
			return done(null, user);
		});
	});
});
