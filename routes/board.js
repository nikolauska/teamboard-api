'use strict';

var express  = require('express');
var mongoose = require('mongoose');

var error      = require('../utils/error');
var config     = require('../config');
var emitter    = require('../config/emitter');
var middleware = require('../middleware');

var User     = mongoose.model('user');
var Board    = mongoose.model('board');
var Ticket   = mongoose.model('ticket');

var Router   = express.Router();
var ObjectId = mongoose.Types.ObjectId;


// automagically resolve 'id' attributes to their respective documents
Router.param('user_id',   middleware.resolve.user());
Router.param('board_id',  middleware.resolve.board());
Router.param('ticket_id', middleware.resolve.ticket());


Router.route('/')

	/**
	 * Returns the boards that have been created by the user making the request.
	 */
	.get(middleware.authenticate('user'))
	.get(function(req, res, next) {
		Board.find({ createdBy: req.user.id })
			.populate('createdBy')
			.exec(function(err, boards) {
				if(err) {
					return next(error(500, err));
				}
				return res.json(200, boards);
			});
	})

	/**
	 * Create a new board.
	 *
	 * TODO The 'background' attribute should probably be some sort of an
	 *      enumeration.
	 * TODO Validate the given payload. Can be done in the 'board' model.
	 *
	 * {
	 *   'name': 'cool-board',
	 *   'info': 'cool things only',
	 *   'size': {
	 *     'width':  8,
	 *     'height': 8
	 *   },
	 *   'background': 'none'
	 * }
	 */
	.post(middleware.authenticate('user'))
	.post(function(req, res, next) {
		var board = new Board({
			name:       req.body.name,
			info:       req.body.info,
			size:       req.body.size,
			background: req.body.background,
			createdBy:  req.user.id
		});

		board.save(function(err, board) {
			if(err) {
				return next(error(400, err));
			}
			Board.populate(board, 'createdBy', function(err, board) {
				if(err) {
					return next(error(500, err));
				}
				return res.json(201, board);
			});
		});
	});


Router.route('/:board_id')

	/**
	 * Get a specific board.
	 */
	.get(middleware.authenticate('user', 'guest'))
	.get(middleware.relation('user', 'guest'))
	.get(function(req, res, next) {
		Board.populate(req.resolved.board, 'createdBy',
			function(err, board) {
				if(err) {
					return next(error(500, err));
				}
				return res.json(200, board);
			});
	})

	/**
	 * Update the specified board. See [POST /boards] for payload details.
	 *
	 * TODO Validate the payload. Can be done in the 'board' model.
	 */
	.put(middleware.authenticate('user'))
	.put(middleware.relation('user'))
	.put(function(req, res, next) {
		var board            = req.resolved.board;
		    board.name       = req.body.name;
		    board.info       = req.body.info;
		    board.size       = req.body.size;
		    board.background = req.body.background;

		board.save(function(err, board) {
			if(err) {
				return next(error(400, err));
			}
			Board.populate(board, 'createdBy', function(err, board) {
				if(err) {
					return next(error(500, err));
				}
				return res.json(200, board);
			});
		});
	})

	/**
	 * Remove the specified board.
	 */
	.delete(middleware.authenticate('user'))
	.delete(middleware.relation('user'))
	.delete(function(req, res, next) {
		// TODO rather use 'Board.remove'
		req.resolved.board.remove(function(err) {
			if(err) {
				return next(error(500, err));
			}
			return res.json(200, req.resolved.board);
		});
	});


Router.route('/:board_id/tickets')

	/**
	 * Get the tickets belonging to the specified board.
	 */
	.get(middleware.authenticate('user', 'guest'))
	.get(middleware.relation('user', 'guest'))
	.get(function(req, res) {
		var boardid = req.resolved.board.id;
		Ticket.find({ 'board_id': boardid }, function(err, tickets) {
			if(err) {
				return next(error(500, err));
			}
			return res.json(200, board.tickets);
		});
	})

	/**
	 * Create a new ticket on the specified board.
	 *
	 * TODO Validate the payload. Can be done in the 'ticket' model. Remember
	 *      to check for a 'ValidationError' on save.
	 * TODO Add a post-save hook on ticket to also add it to the board's
	 *      'tickets' collection.
	 *
	 * {
	 *   'color':   '#BABABA'
	 *   'heading': 'for sharks only'
	 *   'content': 'important stuff'
	 *   'position': {
	 *     'x': 0
	 *     'y': 0
	 *     'z': 0
	 *   }
	 * }
	 */
	.post(middleware.authenticate('user', 'guest'))
	.post(middleware.relation('user', 'guest'))
	.post(function(req, res, next) {

		var newTicket = new Ticket({
			'color':    req.body.color,
			'heading':  req.body.heading,
			'content':  req.body.content,
			'position': req.body.position,
			'board_id': req.resolved.board.id
		});

		newTicket.save(function(err, ticket) {
			if(err) {
				return next(error(400, err));
			}

			emitter.to(req.resolved.board.id)
				.emit('ticket:create', {
					user:   req.user,
					board:  req.resolved.board.id,
					ticket: ticket.toObject()
				});

			return res.json(201, ticket);
		});
	});


Router.route('/:board_id/tickets/:ticket_id')

	/**
	 * Updates the given ticket.
	 *
	 * TODO Validate the payload.
	 */
	.put(middleware.authenticate('user', 'guest'))
	.put(middleware.relation('user', 'guest'))
	.put(function(req, res, next) {
		Ticket.findByIdAndUpdate(req.resolved.ticket.id, req.body,
			function(err, ticket) {
				if(err) {
					return next(error(500, err));
				}

				emitter.to(req.resolved.board.id)
					.emit('ticket:update', {
						user:   req.user,
						board:  req.resolved.board.id,
						ticket: ticket.toObject()
					});

				return res.json(200, ticket);
			});
	})

	/**
	 * Delete the specified ticket.
	 */
	.delete(middleware.authenticate('user', 'guest'))
	.delete(middleware.relation('user', 'guest'))
	.delete(function(req, res, next) {
		req.resolved.ticket.remove(function(err) {
			if(err) {
				return next(error(500, err));
			}

			emitter.to(req.resolved.board.id)
				.emit('ticket:remove', {
					user:   req.user,
					board:  req.resolved.board.id,
					ticket: req.resolved.ticket.toObject()
				});

			return res.json(200, req.resolved.ticket);
		});
	});


Router.route('/:board_id/access/:code')

	/**
	 * Generates a 'guest' token to the given board. That can be passed in with
	 * requests to
	 *
	 * payload:
	 *   {
	 *     'username': 'nick'
	 *   }
	 *
	 * sets headers:
	 *   'x-access-token' : 'guest-token'
	 */
	.post(function(req, res, next) {

		var jwt   = require('jsonwebtoken');
		var board = req.resolved.board;

		// requested board must have a 'accessCode' set
		if(!board.accessCode || board.accessCode != req.params.accessCode) {
			return next(error(401, ''));
		}

		// TODO guest must have a _valid_ username
		var guestPayload = {
			id:         require('crypto').randomBytes(8).toString('hex'),
			type:       'guest',
			username:   req.body.username,
			accessCode: board.accessCode
		}

		// grant access to guest
		var guestToken = jwt.sign(guestPayload, config.token.secret);

		return res.set('x-access-token', guestToken).send(200);
	});


module.exports = Router;
