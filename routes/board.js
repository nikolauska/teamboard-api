'use strict';

var express  = require('express');
var mongoose = require('mongoose');

var utils      = require('../utils');
var config     = require('../config');
var emitter    = require('../config/emitter');
var middleware = require('../middleware');

var Board  = mongoose.model('board');
var Ticket = mongoose.model('ticket');

var Router   = express.Router();
var ObjectId = mongoose.Types.ObjectId;


// automagically resolve 'id' attributes to their respective documents
Router.param('board_id',  middleware.resolve.board);
Router.param('ticket_id', middleware.resolve.ticket);


Router.route('/')

	/**
	 * Returns the boards that have been created by the user making the request.
	 *
	 * returns:
	 *   An array of board objects.
	 */
	.get(middleware.authenticate('user'))
	.get(function(req, res, next) {
		Board.find({ createdBy: req.user.id })
			.populate('createdBy')
			.exec(function(err, boards) {
				if(err) {
					return next(utils.error(500, err));
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
	 *   'name':       'cool-board'
	 *   'info':       'cool things only'
	 *   'background': 'none'
	 *   'size': {
	 *     'width', 'height'
	 *   }
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
				return next(utils.error(400, err));
			}
			Board.populate(board, 'createdBy', function(err, board) {
				if(err) {
					return next(utils.error(500, err));
				}
				return res.json(201, board);
			});
		});
	});


Router.route('/:board_id')

	/**
	 * Get a specific board.
	 *
	 * returns:
	 *   The specified board object.
	 */
	.get(middleware.authenticate('user', 'guest'))
	.get(middleware.relation('user', 'guest'))
	.get(function(req, res, next) {
		Board.populate(req.resolved.board, 'createdBy',
			function(err, board) {
				if(err) {
					return next(utils.error(500, err));
				}
				return res.json(200, board);
			});
	})

	/**
	 * Update the specified board. See [POST /boards] for payload details.
	 *
	 * TODO Validate the payload. Can be done in the 'board' model.
	 *
	 * payload:
	 *   {
	 *     'name':       'new-name'
	 *     'info':       'new-info'
	 *     'background': 'new-background'
	 *     'size': {
	 *       'width', 'height'
	 *     }
	 *   }
	 *
	 * returns:
	 *   The updated board object.
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
				return next(utils.error(400, err));
			}
			Board.populate(board, 'createdBy', function(err, board) {
				if(err) {
					return next(utils.error(500, err));
				}
				return res.json(200, board);
			});
		});
	})

	/**
	 * Remove the specified board.
	 *
	 * returns:
	 *   The removed board object.
	 */
	.delete(middleware.authenticate('user'))
	.delete(middleware.relation('user'))
	.delete(function(req, res, next) {
		req.resolved.board.remove(function(err) {
			if(err) {
				return next(utils.error(500, err));
			}
			return res.json(200, req.resolved.board);
		});
	});


Router.route('/:board_id/tickets')

	/**
	 * Get the tickets belonging to the specified board.
	 *
	 * returns:
	 *   An array of ticket objects.
	 */
	.get(middleware.authenticate('user', 'guest'))
	.get(middleware.relation('user', 'guest'))
	.get(function(req, res) {
		var boardid = req.resolved.board.id;
		Ticket.find({ 'board_id': boardid }, function(err, tickets) {
			if(err) {
				return next(utils.error(500, err));
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
	 * payload:
	 *   {
	 *     'color':   '#BABABA'
	 *     'heading': 'for sharks only'
	 *     'content': 'important stuff'
	 *     'position': {
	 *       'x', 'y', 'z'
	 *     }
	 *   }
	 *
	 * returns:
	 *   The created ticket object.
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
				return next(utils.error(400, err));
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
	 *
	 * payload:
	 *   {
	 *     'color':    '#FFF'
	 *     'heading':  'new-heading'
	 *     'content':  'new-content'
	 *     'position': {
	 *       'x', 'y', 'z'
	 *     }
	 *   }
	 *
	 * returns:
	 *   The updated ticket object.
	 */
	.put(middleware.authenticate('user', 'guest'))
	.put(middleware.relation('user', 'guest'))
	.put(function(req, res, next) {
		Ticket.findByIdAndUpdate(req.resolved.ticket.id, req.body,
			function(err, ticket) {
				if(err) {
					return next(utils.error(500, err));
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
	 *
	 * returns:
	 *   The deleted ticket object.
	 */
	.delete(middleware.authenticate('user', 'guest'))
	.delete(middleware.relation('user', 'guest'))
	.delete(function(req, res, next) {
		req.resolved.ticket.remove(function(err) {
			if(err) {
				return next(utils.error(500, err));
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

Router.route('/:board_id/access')

	/**
	 * Get the 'access-code' of the given board.
	 *
	 * returns:
	 *   {
	 *     'accessCode': 'WxYz8Bd'
	 *   }
	 */
	.get(middleware.authenticate('user'))
	.get(middleware.relation('user'))
	.get(function(req, res) {
		return res.json(200, {
			accessCode: req.resolved.board.accessCode || ''
		});
	})

	/**
	 * Generate a new 'access-code' for the given board. Will replace any
	 * existing 'access-code', invalidating any 'guest-tokens' tied to it.
	 *
	 * returns:
	 *   {
	 *     'accessCode': 'WxYz8Bd'
	 *   }
	 */
	.post(middleware.authenticate('user'))
	.post(middleware.relation('user'))
	.post(function(req, res, next) {
		// Generate an 'access-code' for the specified board.
		var accessCode = require('crypto').randomBytes(4).toString('hex');

		// Attach the generated 'access-code' to the specified board.
		req.resolved.board.accessCode = accessCode;
		req.resolved.board.save(function(err, board) {
			if(err) {
				return next(utils.error(500, err));
			}
			return res.json(200, { accessCode: board.accessCode });
		});
	})

	/**
	 * Remove the existing 'access-code' invalidating all 'guest-tokens' tied
	 * to it. This will essentially hide the board from outside eyes.
	 */
	.delete(middleware.authenticate('user'))
	.delete(middleware.relation('user'))
	.delete(function(req, res, next) {
		req.resolved.board.accessCode = null;
		req.resolved.board.save(function(err) {
			if(err) {
				return next(utils.error(500, err));
			}
			return res.send(204);
		});
	});


Router.route('/:board_id/access/:code')

	/**
	 * Generates a 'guest' token to the given board.
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

		// Requested board must have a 'accessCode' set.
		if(!board.accessCode || board.accessCode != req.params.accessCode) {
			return next(utils.error(401, ''));
		}

		// TODO Guest must have a valid 'username'.
		var guestPayload = {
			id:         require('crypto').randomBytes(4).toString('hex'),
			type:       'guest',
			username:   req.body.username,
			accessCode: board.accessCode
		}

		// Generate the 'guest-token' for access.
		var guestToken = jwt.sign(guestPayload, config.token.secret);

		return res.set('x-access-token', guestToken)
			.json(200, guestPayload);
	});


module.exports = Router;
