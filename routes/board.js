'use strict';

var _        = require('lodash');
var express  = require('express');
var mongoose = require('mongoose');
var Promise  = require('promise');
var request  = require('request');

var utils      = require('../utils');
var config     = require('../config');
var middleware = require('../middleware');

var Event   = mongoose.model('event');
var Board   = mongoose.model('board');
var Ticket  = mongoose.model('ticket');
var User    = mongoose.model('user');
var Session = mongoose.model('session');
var Router   = express.Router();
var ObjectId = mongoose.Types.ObjectId;

var exportAs = require('../utils/export');


// automagically resolve 'id' attributes to their respective documents
Router.param('board_id',  middleware.resolve.board);
Router.param('ticket_id', middleware.resolve.ticket);

Router.route('/boards')

	/**
	 * Returns the boards that have been created by the user making the
	 * request. If the requestee is a guest, returns the board the guest has
	 * access to.
	 *
	 * returns:
	 *   An array of board objects.
	 */
	.get(middleware.authenticate('user', 'guest'))
	.get(function(req, res, next) {
		var boardQuery = null;

		if(req.user.type === 'temporary') {
			// Guests can only see the board they have access to...
			boardQuery = Board.find({ _id: req.user.access }).populate('members.user');
		}
		else {
			// Normal users see the boards they are member or admin to.
			boardQuery = Board.find({'members.user': req.user.id }).populate('members.user');
		}

		boardQuery.exec(function(err, boards) {
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
		var payload     = req.body;
		payload.members = [];

		if(payload.size.height <= 0 || payload.size.width <= 0) {
			return next(utils.error(400, 'Board size must be larger than 0!'));
		}

		if(!(payload.size.height % 1 === 0) || !(payload.size.width % 1 === 0)) {
			return next(utils.error(400, 'Board size must be whole numbers!'));
		}

		if (payload.size)
			payload.members.push({user: req.user.id, role: 'admin', isActive: true, lastSeen: Date.now()});

		new Board(payload).save(function(err, board) {
			if(err) {
				return next(utils.error(400, err));
			}

			board.populate('members.user', function(err) {			
					new Event({
						'type': 'BOARD_CREATE',
						'board': board.id,
						'user':  {
							'id':       req.user.id,
							'type':     req.user.type,
							'username': req.user.username,
						}
					}).save(function(err, ev) {
						if(err) return console.error(err);
						utils.emitter.to(ev.board).emit('board:event', ev.toObject());
					});

					return res.json(201, board);})
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
	.get(middleware.relation('admin', 'user', 'guest'))
	.get(function(req, res, next) {
		var boardQuery = Board.findOne({ '_id': req.resolved.board.id, 'members.user': req.user.id }).populate('members.user');

		boardQuery.exec(function(err, board) {
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
	 *     }bout.
	 *   }
	 *
	 * returns:
	 *   The updated board object.
	 */
	.put(middleware.authenticate('user'))
	.put(middleware.relation('admin'))
	.put(function(req, res, next) {
		var old            = req.resolved.board.toObject();
		req.resolved.board = _.merge(req.resolved.board, req.body);

		var ticketWidth = 192;
		var ticketHeight = 108;

		if (!req.resolved.board) {
			return next(utils.error(404, 'Board not found!'));
		}

		if(req.resolved.board.size.height <= 0 || req.resolved.board.size.width <= 0) {
			return next(utils.error(400, 'Board size must be larger than 0!'));
		}

		if(!(req.resolved.board.size.height % 1 === 0) || !(req.resolved.board.size.width % 1 === 0)) {
			return next(utils.error(400, 'Board size must be whole numbers!'));
		}

		return req.resolved.board.save(function(err, board) {
			if(err) {
				return next(utils.error(400, err));
			}
			Board.populate(board, 'createdBy', function(err, board) {
				Board.populate(board, 'members.user', function(err, board) {
					if(err) {
					return next(utils.error(500, err));
				}

				if(req.resolved.board.size.width < old.size.width || req.resolved.board.size.height < old.size.height){
					Ticket.find({ 'board': req.resolved.board.id,
						$or: [
								{'position.x': {$gt: (req.resolved.board.size.width * ticketWidth) - ticketWidth / 2}},
								{'position.y': {$gt: (req.resolved.board.size.height * ticketHeight) - ticketHeight / 2}}
						     ]}, function (err, tickets) {

						if(tickets.length > 0) {
							Promise.all(tickets.map(utils.ticketClamper(req.resolved.board))).then(function(){

								utils.createEditBoardEvent(req, board, old);
							})
						}
					});
				} else {

					utils.createEditBoardEvent(req, board, old);
				}

				return res.json(200, board);
				});
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
	.delete(middleware.relation('admin'))
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
				utils.emitter.to(ev.board).emit('board:event', ev.toObject());
			});

			return res.json(200, req.resolved.board);
		});
	});

Router.route('/boards/:board_id/export')

	/**
	 * Export board either json, csv, plaintext or image
	 */
	.get(middleware.authenticate('user', 'guest'))
	.get(middleware.relation('admin', 'user', 'guest'))
	.get(function(req, res, next) {
		var format = req.query.format ? req.query.format : 'json';

		var boardQuery = Board.findById(req.resolved.board.id)
			.populate({
				'path':   'members.user',
				'select': '-_id -__v -password -token',
			})
			.select('-_id -__v -accessCode').lean();

		boardQuery.exec(function(err, board) {

			if(err) {
				return next(utils.error(500, err));
			}

			var ticketQuery = Ticket.find({ 'board': req.resolved.board.id })
				.select('-_id -__v -board').populate('comments.user').lean();

			ticketQuery.exec(function(err, tickets) {

				if(err) {
					return next(utils.error(500, err));
				}

				if(board.name == '')
					board.name = 'board';
				else
					// Edit board name incase name is not valid filename
					board.name = utils.sanitize(board.name,'');

				if(format == 'csv') {
					return res.attachment(board.name + '.csv').send(200, exportAs.generateCSV(board, tickets));
				}

				if(format == 'plaintext') {
					return res.attachment(board.name + '.txt').send(200, exportAs.generatePlainText(board, tickets));
				}

				if(format == 'image') {
					return exportAs.postImage(req, board, tickets, function(options) {
						request.post(options).pipe(res);
					});
				}

				var boardObject     	= board;
				    boardObject.tickets = tickets;

				return res.attachment(board.name + '.json').json(200, boardObject);
			});
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
	.get(middleware.relation('admin', 'user', 'guest'))
	.get(function(req, res) {
		var board = req.resolved.board;

		var ticketQuery = Ticket.find({'board': board.id}).populate('comments.user');

		ticketQuery.exec(function(err, tickets) {
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
	.post(middleware.relation('admin', 'user', 'guest'))
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
					'id':       ticket._id,
					'color':    ticket.color,
					'content':  ticket.content,
					'position': ticket.position,
				}
			}).save(function(err, ev) {
				if(err) {
					return console.error(err);
				}
				utils.emitter.to(ticket.board)
					.emit('board:event', ev.toObject());
			});

			/**
			 * Deprecated.
			 */
			utils.emitter.to(req.resolved.board.id)
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
	.put(middleware.relation('admin', 'user', 'guest'))
	.put(function(req, res, next) {
		var old             = req.resolved.ticket.toObject();
		req.resolved.ticket = _.merge(req.resolved.ticket, req.body);

		return req.resolved.ticket.save(function(err, ticket) {
			if(err) {
				return next(utils.error(500, err));
			}

			if(!ticket) return next(utils.error(404, 'Ticket not found'));

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
						'color':    old.color,
						'heading':  old.heading,
						'content':  old.content,
						'position': old.position,
					},

					'newAttributes': {
						'color':    ticket.color,
						'heading':  ticket.heading,
						'content':  ticket.content,
						'position': ticket.position,
					},
				}
			}).save(function(err, ev) {
				if(err) {
					return console.error(err);
				}
				utils.emitter.to(ev.board)
					.emit('board:event', ev.toObject());
			});

			/**
			 * Deprecated.
			 */
			utils.emitter.to(req.resolved.board.id)
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
	.delete(middleware.relation('admin', 'user', 'guest'))
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
				utils.emitter.to(ev.board)
					.emit('board:event', ev.toObject());
			});

			/**
			 * Deprecated.
			 */
			utils.emitter.to(req.resolved.board.id)
				.emit('ticket:remove', {
					user:   req.user,
					board:  req.resolved.board.id,
					ticket: req.resolved.ticket.toObject()
				});

			return res.json(200, req.resolved.ticket);
		});
	});


Router.route('/boards/:board_id/tickets/:ticket_id/comments')

/**
 * Post a new comment on the specified ticket.
 */
	.post(middleware.authenticate('user', 'guest'))
	.post(middleware.relation('user', 'guest'))
	.post(function(req, res, next) {

		var old             = req.resolved.ticket.toObject();
		req.resolved.ticket = _.merge(req.resolved.ticket, req.body);

		var userId = null;

		// Backwards compatibility for older clients for guest users
		if(ObjectId.isValid(req.user.id)) {
			userId = req.user.id
		}
		req.resolved.ticket.comments.unshift({ 'user':  userId, 'content': req.body.comment});

		req.resolved.ticket.save(function (err, ticket) {
			if(err) {
				return next(utils.error(500, err));
			}

			if (!ticket) {
				return next(utils.error(404, 'Ticket not found'));
			}

			ticket.populate('comments.user', function(err) {
			/*
			 * TODO: TICKET_COMMENT event?
			 */
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
							'color':    old.color,
							'content':  old.content,
							'heading':  old.heading,
							'position': old.position,
							'comments': old.comments
						},

						'newAttributes': {
							'color':    ticket.color,
							'content':  ticket.content,
							'heading':  ticket.heading,
							'position': ticket.position,
							'comments': ticket.comments
						},
					}
				}).save(function(err, ev) {
						if(err) {
							return console.error(err);
						}
						utils.emitter.to(ev.board)
							.emit('board:event', ev.toObject());
					});
				return res.json(200, ticket);})

		})
	});

Router.route('/boards/:board_id/events')

	/**
	 * Get a list of 'events' that have occurred on this board.
	 *
	 * returns:
	 *   [ EventObject ]
	 */
	.get(middleware.authenticate('user', 'guest'))
	.get(middleware.relation('admin', 'user', 'guest'))
	.get(function(req, res, next) {
		Event.find({ 'board': req.resolved.board.id }, function(err, evs) {
			if(err) {
				return next(utils.error(500, err));
			}
			return res.json(200, evs);
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
	.get(middleware.relation('admin'))
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
	.post(middleware.relation('admin'))
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
				utils.emitter.to(ev.board)
					.emit('board:event', ev.toObject());
			});

			return res.json(200, { accessCode: board.accessCode });
		});
	})

	/**
	 * Remove the existing 'access-code' invalidating all 'guest-tokens' tied
	 * to it. This will essentially hide the board from outside eyes.
	 */
	.delete(middleware.authenticate('user'))
	.delete(middleware.relation('admin'))
	.delete(function(req, res, next) {
		req.resolved.board.accessCode = null

		req.resolved.board.members = [];
		req.resolved.board.members.push({user: req.user.id, role: 'admin', isActive: true, lastSeen: Date.now()});

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
				utils.emitter.to(ev.board)
					.emit('board:event', ev.toObject());
			});

			return res.send(200);
		});
	});

Router.route('/boards/:board_id/access/:code/grantaccess')

/**
 * Gives an already registered user access to a board
 *
 */
	.put(middleware.authenticate('user'))
	.put(function(req, res, next) {

		var board = req.resolved.board;
		var user = req.user;
		var isMember = false;
		// User is already a member of this  baord.
		board.members.map(function (member) {
			if (member.user == user.id) {
				isMember = true;
			}
		});

		if(!isMember) {
			board.members.push({user: user.id, role: 'member', isActive: true, lastSeen: Date.now()});
			board.save(function (err, board) {
				if (err) {
					return next(utils.error(500, err));
				}
				return res.json(200, board);

			})
		}
		else {
			return res.json(200, board);
		}
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
		var jwt    = require('jsonwebtoken');
		var secret = config.token.secret;
		var board  = req.resolved.board;

		// Requested board must have a 'accessCode' set.
		if(!board.accessCode || board.accessCode != req.params.code) {
			return next(utils.error(401, ''));
		}

		new User({
			name:          req.body.username,
			account_type: 'temporary',
			created_at: new Date(),
			boards:[{id: board._id}] })
			.save(function(err, user) {
				if(err) {
					if(err.name == 'ValidationError') {
						return next(utils.error(400, err));
					}
					if(err.name == 'MongoError' && err.code == 11000) {
						return next(utils.error(409, 'User already exists'));
					}
					return next(utils.error(500, err));
				}

				var payload = {
					id:         user.id,
					type:       user.account_type,
					access:     board.id,
					accessCode: board.accessCode,
					username:   user.name,
					boards:     user.boards
				}

				var guestToken = jwt.sign(payload, secret);

				board.members.push({user: user.id, role: 'guest', isActive: true, lastSeen: Date.now()});
				board.save(function (err, board) {
					if (err) {
						return next(utils.error(500, err));
					}

				new Event({
					'type': 'BOARD_GUEST_JOIN',
					'board': req.resolved.board.id,
					'user': {
						'id':       user.id,
						'type':     user.account_type,
						'username': user.name,
					},
					}).save(function(err, ev) {
						if(err) {
							return console.error(err);
						}
						utils.emitter.to(ev.board)
							.emit('board:event', ev.toObject());

						new Session({
							user:       user.id,
							user_agent: req.headers['user-agent'],
							token:      guestToken,
							created_at: new Date()
						}).save(function(err, newsession) {
								if(err) {
									if(err.name == 'ValidationError') {
										return next(utils.error(400, err));
									}
									if(err.name == 'MongoError' && err.code == 11000) {
										return next(utils.error(409, 'Creating new session failed'));
									}
									return next(utils.error(500, err));
								}
								return res.set('x-access-token', guestToken).json(200, payload);
							});
					});
				});
			});
	});

Router.route('/boards/:board_id/setactivity')

/**
 * Sets user active or unactive in a baord
 *
 * payload:
 *   {
 *     'activity': 'true'
 *   }

 */
	.post(middleware.authenticate('user', 'guest'))
	.post(middleware.relation('user', 'guest'))
	.post(function(req, res, next) {
		var old            = req.resolved.board.toObject();

		var boardQuery = Board.findOneAndUpdate({_id:req.resolved.board, 'members.user': req.user.id}, {'$set': {
			'members.$.isActive': req.body.isActive,
			'members.$.lastSeen': Date.now()
		}}).populate('members.user');

		boardQuery.exec(function(err, board) {
			if (err) return next(utils.error(500, err));
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
						'name':             old.name,
						'description':      old.description,
						'background':       old.background,
						'customBackground': old.customBackground,
						'size': {
							'width':  old.size.width,
							'height': old.size.height,
						},
						'members':         old.members
					},
					'newAttributes': {
						'name':             board.name,
						'description':      board.description,
						'background':       board.background,
						'customBackground': board.customBackground,
						'size': {
							'width':  board.size.width,
							'height': board.size.height,
						},
						'members':    board.members
					}
				}
			}).save(function(err, ev) {
					if(err) {
						return console.error(err);
					}

					utils.emitter.to(board.id).emit('board:event', ev.toObject());
				});
			return res.send(200);

		});

	})
	/*
	 *
	 * Very simple helper function to poll from client, to update user activity and last seen
	 *
	 */
	.put(middleware.authenticate('user', 'guest'))
	.put(middleware.relation('user', 'guest'))
	.put(function(req, res, next) {
		var old = req.resolved.board;
		var oldActive = null;
		_(old.members).forEach(function(member) {
			if (member.user == req.user.id) {
				oldActive = member.isActive;
			}
		});

		var boardQuery = Board.findOneAndUpdate({_id:req.resolved.board ,'members.user': req.user.id}, {'$set': {
			'members.$.isActive': true,
			'members.$.lastSeen': Date.now()
		}}).populate('members.user');
		boardQuery.exec(function(err, board) {
			if (err) return next(utils.error(500, err));

			if (oldActive === false) {
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
							'name':             old.name,
							'description':      old.description,
							'background':       old.background,
							'customBackground': old.customBackground,
							'size': {
								'width':  old.size.width,
								'height': old.size.height,
							},
							'members':         old.members
						},
						'newAttributes': {
							'name':             board.name,
							'description':      board.description,
							'background':       board.background,
							'customBackground': board.customBackground,
							'size': {
								'width':  board.size.width,
								'height': board.size.height,
							},
							'members':    board.members
						}
					}
				}).save(function(err, ev) {
						if(err) {
							return console.error(err);
						}
						utils.emitter.to(board.id).emit('board:event', ev.toObject());
					});
			}

			return res.send(200);
		});

	});

module.exports = Router;
