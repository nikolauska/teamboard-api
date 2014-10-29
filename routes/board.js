'use strict';

var express  = require('express');
var mongoose = require('mongoose');

var utils      = require('../utils');
var config     = require('../config');
var emitter    = require('../config/emitter');
var middleware = require('../middleware');

var Event  = mongoose.model('event');
var Board  = mongoose.model('board');
var Ticket = mongoose.model('ticket');

var Router   = express.Router();
var ObjectId = mongoose.Types.ObjectId;


// automagically resolve 'id' attributes to their respective documents
Router.param('board_id',  middleware.resolve.board);
Router.param('ticket_id', middleware.resolve.ticket);


Router.route('/boards')

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
	 *   'name':        'cool-board'
	 *   'description': 'cool things only'
	 *   'background':  'none'
	 *   'size': {
	 *     'width', 'height'
	 *   }
	 * }
	 */
	.post(middleware.authenticate('user'))
	.post(function(req, res, next) {

		var payload           = req.body;
		    payload.createdBy = req.user.id;

		new Board(payload).save(function(err, board) {
			if(err) {
				return next(utils.error(400, err));
			}

			Board.populate(board, 'createdBy', function(err, board) {
				if(err) {
					return next(utils.error(500, err));
				}

				new Event({
					'type': 'BOARD_CREATE',
					'board': board.id,
					'user':  {
						'id':       req.user.id,
						'type':     req.user.type,
						'username': req.user.username,
					}
				}).save(function(err) {
					if(err) return console.error(err);
				});

				return res.json(201, board);
			});
		});
	});


Router.route('/boards/:board_id')

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
	 *     'name':        'new-name'
	 *     'description': 'new-info'
	 *     'background':  'new-background'
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
		var id = req.resolved.board.id;

		// Make sure we have a handle to the previous attributes.
		var old = req.resolved.board.toObject()

		// TODO How to make sure only certain fields are updated, something in
		//      the actual 'model'?
		Board.findByIdAndUpdate(id, req.body, function(err, board) {
			if(err) {
				return next(utils.error(400, err));
			}

			Board.populate(board, 'createdBy', function(err, board) {
				if(err) {
					return next(utils.error(500, err));
				}

				new Event({
					'type': 'BOARD_EDIT',
					'board': board.id,
					'user':  {
						'id':       req.user.id,
						'type':     req.user.type,
						'username': req.user.username,
					},
					'data': {
						'oldAttributes': {
							'name':        old.name,
							'description': old.description,
							'background':  old.background,
							'size': {
								'width':  old.size.width,
								'height': old.size.height,
							}
						},
						'newAttributes': {
							'name':        board.name,
							'description': board.description,
							'background':  board.background,
							'size': {
								'width':  board.size.width,
								'height': board.size.height,
							}
						}
					}
				}).save(function(err, ev) {
					if(err) {
						return console.error(err);
					}
					emitter.to(board.id).emit('board:event', ev.toObject());
				});

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

			new Event({
				'type':  'BOARD_REMOVE',
				'board': req.resolved.board.id,
				'user': {
					'id':       req.user.id,
					'type':     req.user.type,
					'username': req.user.username,
				}
			}).save(function(err, ev) {
				if(err) {
					return console.error(err);
				}
				emitter.to(ev.board).emit('board:event', ev.toObject());
			});

			return res.json(200, req.resolved.board);
		});
	});


Router.route('/boards/:board_id/tickets')

	/**
	 * Get the tickets belonging to the specified board.
	 *
	 * returns:
	 *   An array of ticket objects.
	 */
	.get(middleware.authenticate('user', 'guest'))
	.get(middleware.relation('user', 'guest'))
	.get(function(req, res) {
		var board = req.resolved.board;
		Ticket.find({ 'board': board.id }, function(err, tickets) {
			if(err) {
				return next(utils.error(500, err));
			}
			return res.json(200, tickets);
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

		var payload       = req.body;
		    payload.board = req.resolved.board.id;

		new Ticket(payload).save(function(err, ticket) {
			if(err) {
				return next(utils.error(400, err));
			}

			new Event({
				'type': 'TICKET_CREATE',
				'board': ticket.board,
				'user': {
					'id':       req.user.id,
					'type':     req.user.type,
					'username': req.user.username,
				},
				'data': {
					'id': ticket._id,
				}
			}).save(function(err, ev) {
				if(err) {
					return console.error(err);
				}
				emitter.to(ticket.board).emit('board:event', ev.toObject());
			});

			/**
			 * Deprecated.
			 */
			emitter.to(req.resolved.board.id)
				.emit('ticket:create', {
					user:   req.user,
					board:  req.resolved.board.id,
					ticket: ticket.toObject()
				});

			return res.json(201, ticket);
		});
	});


Router.route('/boards/:board_id/tickets/:ticket_id')

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
		// Store a reference to the old ticket attributes.
		var old = req.resolved.ticket.toObject();

		// TODO Deprecate changing 'position' here, instead move to a separate
		//      method, which will also provide the 'TICKET_MOVE' event.
		Ticket.findByIdAndUpdate(req.resolved.ticket.id, req.body,
			function(err, ticket) {
				if(err) {
					return next(utils.error(500, err));
				}

				// TODO utils.emit('TICKET_EDIT', { board, user }, { data })
				new Event({
					'type': 'TICKET_EDIT',
					'board': ticket.board,
					'user': {
						'id':       req.user.id,
						'type':     req.user.type,
						'username': req.user.username,
					},
					'data': {
						'id': ticket._id,

						'oldAttributes': {
							'color':   old.color,
							'heading': old.heading,
							'content': old.content,
						},

						'newAttributes': {
							'color':   ticket.color,
							'heading': ticket.heading,
							'content': ticket.content,
						},
					}
				}).save(function(err, ev) {
					if(err) {
						return console.error(err);
					}
					emitter.to(ev.board).emit('board:event', ev.toObject());
				});

				/**
				 * Deprecated.
				 */
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

			new Event({
				'type': 'TICKET_REMOVE',
				'board': req.resolved.ticket.board,
				'user': {
					'id':       req.user.id,
					'type':     req.user.type,
					'username': req.user.username,
				},
				'data': {
					'id': req.resolved.ticket._id,
				}
			}).save(function(err, ev) {
				if(err) {
					return console.error(err);
				}
				emitter.to(ev.board).emit('board:event', ev.toObject());
			});

			/**
			 * Deprecated.
			 */
			emitter.to(req.resolved.board.id)
				.emit('ticket:remove', {
					user:   req.user,
					board:  req.resolved.board.id,
					ticket: req.resolved.ticket.toObject()
				});

			return res.json(200, req.resolved.ticket);
		});
	});

Router.route('/boards/:board_id/access')

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

			new Event({
				'type': 'BOARD_PUBLISH',
				'board': req.resolved.board.id,
				'user': {
					'id':       req.user.id,
					'type':     req.user.type,
					'username': req.user.username,
				},
				'data': {
					'accessCode': accessCode,
				}
			}).save(function(err, ev) {
				if(err) {
					return console.error(err);
				}
				emitter.to(ev.board).emit('board:event', ev.toObject());
			});

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

			new Event({
				'type': 'BOARD_UNPUBLISH',
				'board': req.resolved.board.id,
				'user': {
					'id':       req.user.id,
					'type':     req.user.type,
					'username': req.user.username,
				},
			}).save(function(err, ev) {
				if(err) {
					return console.error(err);
				}
				emitter.to(ev.board).emit('board:event', ev.toObject());
			});

			return res.send(200);
		});
	});


Router.route('/boards/:board_id/access/:code')

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
		if(!board.accessCode || board.accessCode != req.params.code) {
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

		new Event({
			'type': 'BOARD_GUEST_JOIN',
			'board': req.resolved.board.id,
			'user': {
				'id':       guestPayload.id,
				'type':     guestPayload.type,
				'username': guestPayload.username,
			},
		}).save(function(err, ev) {
			if(err) {
				return console.error(err);
			}
			emitter.to(ev.board).emit('board:event', ev.toObject());
		});

		return res.set('x-access-token', guestToken)
			.json(200, guestPayload);
	});


module.exports = Router;
