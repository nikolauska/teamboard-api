'use strict';

var jwt    = require('jsonwebtoken');
var utils  = require('../../utils');
var config = require('../index');

var Board           = require('mongoose').model('board');
var BearerStrategy = require('passport-http-bearer').Strategy;

module.exports = new BearerStrategy(function(token, done) {
	jwt.verify(token, config.token.secret, function(err, decoded) {
		if(err) {
			return done(utils.error(401, err));
		}

		// find the board the access token is attached to
		Board.findOne({ pass: decoded.board_pass }, function(err, board) {
			// something bad happened
			if(err) {
				return done(utils.error(500, err));
			}

			// no board with that pass exists
			if(!board) {
				return done(utils.error(401, 'Invalid Board Pass'));
			}

			return done(null, {
				type:     decoded.type,
				username: decoded.username,
				board_id: board.id
			});
		});

		/**
		 * {
		 *   username: 'lauri.kasanen',
		 *   type:     'guest'
		 *   user_id:   null
		 *   board_id: 'board.id'
		 * }
		 * {
		 *   username: 'jukka.salonen',
		 *   type:     'user'
		 *   user_id:  'user.id'
		 *   board_id: null
		 * }
		 */
	});
});
