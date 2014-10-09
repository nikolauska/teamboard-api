'use strict';

var utils    = require('../utils');
var mongoose = require('mongoose');

var User     = mongoose.model('user');
var Board    = mongoose.model('board');
var ObjectId = mongoose.Types.ObjectId;

module.exports.user = function() {
	return function(req, res, next, id) {
		if(!ObjectId.isValid(id)) {
			return next(utils.error(400, 'Invalid ObjectId attribute'));
		}
		User.findOne({ _id: id }, function(err, user) {
			if(err) {
				return next(utils.error(500, err));
			}
			if(!user) {
				return next(utils.error(404, 'User not found'));
			}
			req.resolved      = req.resolved || { }
			req.resolved.user = user;
			return next();
		});
	}
}

module.exports.board = function() {
	return function(req, res, next, id) {
		if(!ObjectId.isValid(id)) {
			return next(utils.error(400, 'Invalid ObjectId attribute'));
		}
		Board.findOne({ _id: id }, function(err, board) {
			if(err) {
				return next(utils.error(500, err));
			}
			if(!board) {
				return next(utils.error(404, 'Board not found'));
			}
			req.resolved       = req.resolved || { }
			req.resolved.board = board;
			return next();
		});
	}
}

module.exports.ticket = function() {
	return function(req, res, next, id) {

		if(!req.resolved || !req.resolved.board) {
			return next(utils.error(404, 'Board not found'));
		}

		if(!ObjectId.isValid(id)) {
			return next(utils.error(400, 'Invalid ObjectId attribute'));
		}

		Ticket.findOne({ '_id': id, 'board_id', req.resolved.board.id },
			function(err, ticket) {
				if(err) {
					return next(utils.error(500, err));
				}

				if(!ticket) {
					return next(utils.error(404, 'Ticket not found'));
				}

				req.resolved        = req.resolved || { }
				req.resolved.ticket = ticket;

				return next();
			});
	}
}
