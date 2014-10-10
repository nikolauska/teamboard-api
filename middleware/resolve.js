'use strict';

var utils    = require('../utils');
var mongoose = require('mongoose');

var User     = mongoose.model('user');
var Board    = mongoose.model('board');
var ObjectId = mongoose.Types.ObjectId;

/**
 * Resolve the 'user_id' URL parameter to a 'user' model.
 */
module.exports.user = function(req, res, next, id) {
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

/**
 * Resolve the 'board_id' URL parameter to a 'board' model.
 */
module.exports.board = function(req, res, next, id) {
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

/**
 * Resolve the 'ticket_id' URL parameter to a 'ticket' model.
 */
module.exports.ticket = function(req, res, next, id) {
	if(!ObjectId.isValid(id)) {
		return next(utils.error(400, 'Invalid ObjectId attribute'));
	}

	var boardid = req.resolved.board.id;

	Ticket.findOne({ '_id': id, 'board_id', boardid }, function(err, ticket) {
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
