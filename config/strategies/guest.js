'use strict';

var jwt    = require('jsonwebtoken');
var utils  = require('../../utils');
var config = require('../index');

var Board          = require('mongoose').model('board');
var BearerStrategy = require('passport-http-bearer').Strategy;

/**
 * Authenticate the requestee as a 'guest' based on the passed 'Bearer' token.
 */
module.exports = new BearerStrategy(function(token, done) {
	jwt.verify(token, config.token.secret, function(err, decoded) {
		if(err) {
			return done(null, null, err);
		}

		Board.findOne({ accessCode: decoded.accessCode }, function(err, board) {
			if(err) {
				return done(utils.error(500, err));
			}

			if(!board) {
				return done(null, null);
			}

			return done(null, {
				id:       decoded.id,
				type:     decoded.type,
				access:   board.id,
				username: decoded.username
			});
		});
	});
});
