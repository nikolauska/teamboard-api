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

		/* Sometimes after clearing the database, User A creating a new board,
		 * User B woulld see the unshared board from User A when fetching /boards.
		 * We end up here if User B was logged in before database was cleared so his
		 * credentials are incorrect. The accessCode of his /boards request is undefined
		 * so Board.findOne will return him the first unshared board of the database. 
		 */
		if(!decoded.accessCode){
			return done(null, null, 'Access denied.');
		}

		Board.findOne({ accessCode: decoded.accessCode }, function(err, board) {
			if(err) {
				return done(utils.error(500, err));
			}

			if(!board) {
				return done(null, null, 'Access denied.');
			}
			return done(null, {
				id:       decoded.id,
				type:     'temporary',
				access:   board.id,
				username: decoded.name
			});
		});
	});
});
