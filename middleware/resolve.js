'use strict';


var error = require('../utils/error');
var User  = require('mongoose').model('user');
var Board = require('mongoose').model('board');

module.exports.user = function() {
	return function(req, res, next, id) {

		User.find({ _id: id }, function(err, users) {

			if(err) {

				if(err.name === 'CastError') {
					return next(error(400, err));
				}

				return next(err);
			}

			// check to see that a user was actually found

			if(!users[0]) {
				return next(error(404, 'User not found'));
			}

			// everything is ok

			req.resolved      = req.resolved || { }
			req.resolved.user = users[0];

			return next();
		});
	}
}

module.exports.board = function() {
	return function(req, res, next, id) {

		var bq = Board.find({ _id: id }, function(err, boards) {

			if(err) {
				if(err.name === 'CastError') {
					return next(error(400, err));
				}
				return next(err);
			}

			// check to see if a board was actually found

			if(!boards[0]) {
				return next(error(404, 'Board not found'));
			}

			// everything is ok

			req.resolved       = req.resolved || { }
			req.resolved.board = boards[0];

			return next();
		});
	}
}

module.exports.ticket = function() {
	return function(req, res, next, id) {

		// this middleware should be invoked after
		// resolving board_id to a board model

		if(!req.resolved || !req.resolved.board) {
			return next(error(404, 'Board not found'));
		}

		var ticket = req.resolved.board.tickets.id(id);

		if(!ticket) {
			return next(error(404, 'Ticket not found'));
		}

		req.resolved.ticket = ticket;

		return next();
	}
}
