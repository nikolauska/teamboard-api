'use strict';

var utils      = require('../utils');
var config     = require('../config');
var emitter    = require('../config/emitter');
var middleware = require('../middleware');

var User     = require('mongoose').model('user');
var Board    = require('mongoose').model('board');
var Router   = require('express').Router();
var ObjectId = require('mongoose').Types.ObjectId;

Router.param('user_id',   middleware.resolve.user());
Router.param('board_id',  middleware.resolve.board());
Router.param('ticket_id', middleware.resolve.ticket());

Router.route('/')
	.get(middleware.authenticate('bearer', 'anonymous'))
	.get(function(req, res, next) {
		var bquery = null;
		if(!req.user) {
			// anonymous users can only see public boards
			bquery = Board.find({ isPublic: true });
		}
		else {
			// registered users can see the boards they own or they
			// are a member of in addition to public boards
			bquery = Board.find().or([
				{ owner: req.user.id },
				{ members: req.user.id },
				{ isPublic: true }
			]);
		}
		bquery.select('-tickets')
			.populate('owner members')
			.exec(function(err, boards) {
				if(err) {
					return next(utils.error(500, err));
				}
				return res.json(200, boards);
			});
	})
	.post(middleware.authenticate('bearer'))
	.post(function(req, res, next) {
		var board = new Board({
			name:     req.body.name,
			info:     req.body.info,
			isPublic: req.body.isPublic,
			owner:    req.user.id
		});
		board.save(function(err, board) {
			if(err) {
				return next(utils.error(400, err));
			}
			return res.json(201, board);
		});
	})
	.delete(middleware.authenticate('bearer'))
	.delete(function(req, res, next) {
		// make sure we receive correct parameters
		if(!req.query.boards) {
			return next(utils.error(400, 'No boards specified'));
		}
		// validate that passed values are valid ObjectIDs
		var ids = req.query.boards.split(',');
		for (var i = 0; i < ids.length; i++) {
			if(!ObjectId.isValid(ids[i])) {
				return next(utils.error(400, 'Valid ObjectID required'));
			}
		}
		// MongoDB operations such as $in seem to require ObjectIDs
		var objids = ids.map(function(id) { return new ObjectId(id); });
		var bquery = Board.find({ '_id': { $in: objids } });
		// all boards in request must be owned by the user
		bquery.exec(function(err, boards) {
			if(err) {
				return next(utils.error(500, err));
			}
			// don't remove any boards if whole query is not valid
			for(var i = 0; i < boards.length; i++) {
				if(!boards[i].isOwner(req.user)) {
					return next(utils.error(403, 'Ownership required'));
				}
			}
			bquery.remove(function(err) {
				if(err) {
					return next(utils.error(500, err));
				}
				return res.json(200, boards);
			});
		});
	});

Router.route('/:board_id')
	.get(middleware.authenticate('bearer', 'anonymous'))
	.get(middleware.relation('*'))
	.get(function(req, res, next) {
		Board.populate(req.resolved.board, 'owner members',
			function(err, board) {
				if(err) {
					return next(utils.error(500, err));
				}
				return res.json(200, board);
			});
	})
	.put(middleware.authenticate('bearer'))
	.put(middleware.relation('owner'))
	.put(function(req, res, next) {
		var board          = req.resolved.board;
		    board.name     = req.body.name;
		    board.info     = req.body.info;
		    board.isPublic = req.body.isPublic;
		board.save(function(err, board) {
			if(err) {
				return next(utils.error(400, err));
			}
			return res.json(200, board);
		});
	})
	.delete(middleware.authenticate('bearer'))
	.delete(middleware.relation('owner'))
	.delete(function(req, res, next) {
		req.resolved.board.remove(function(err) {
			if(err) {
				return next(utils.error(500, err));
			}
			return res.json(200, req.resolved.board);
		});
	});

Router.route('/:board_id/users')
	.get(middleware.authenticate('bearer', 'anonymous'))
	.get(middleware.relation('*'))
	.get(function(req, res, next) {
		Board.populate(req.resolved.board, 'owner members',
			function(err, board) {
				if(err) {
					return next(utils.error(500, err));
				}
				return res.json(200, {
					owner:   board.owner,
					members: board.members
				});
			});
	})
	.post(middleware.authenticate('bearer'))
	.post(middleware.relation('owner'))
	.post(function(req, res, next) {
		var board = req.resolved.board;
		if(!ObjectId.isValid(req.body.id)) {
			return next(utils.error(400, 'Valid ObjectId required'));
		}
		User.findOne({ _id: req.body.id }, function(err, user) {
			if(err) {
				return next(utils.error(500, err));
			}
			if(!user) {
				return next(utils.error(404, 'User not found'));
			}
			if(board.isOwner(user) || board.isMember(user)) {
				return next(utils.error(409, 'User already exists on board'));
			}
			board.members.push(user.id);
			board.save(function(err) {
				if(err) {
					return next(utils.error(500, err));
				}
				return res.json(200, user);
			});
		});
	});

Router.route('/:board_id/users/:user_id')
	.get(middleware.authenticate('bearer', 'anonymous'))
	.get(middleware.relation('*'))
	.get(function(req, res, next) {
		var user  = req.resolved.user;
		var board = req.resolved.board;
		if(board.isOwner(user) || board.isMember(user)) {
			return res.json(200, user);
		}
		return next(utils.error(400, 'User not found'));
	})
	.delete(middleware.authenticate('bearer'))
	.delete(middleware.relation('owner'))
	.delete(function(req, res, next) {
		var user  = req.resolved.user;
		var board = req.resolved.board;
		if(!board.isMember(user)) {
			return next(utils.error(400, 'User not found'));
		}
		board.members.pull(user.id);
		board.save(function(err) {
			if(err) {
				return next(utils.error(500, err));
			}
			return res.json(200, user);
		});
	});

Router.route('/:board_id/tickets')
	.get(middleware.authenticate('bearer', 'anonymous'))
	.get(middleware.relation('*'))
	.get(function(req, res) {
		return res.json(200, req.resolved.board.tickets);
	})
	.post(middleware.authenticate('bearer'))
	.post(middleware.relation('member', 'owner'))
	.post(function(req, res, next) {
		var board  = req.resolved.board;
		var ticket = board.tickets.create({
			owner:    req.user.id,
			color:    req.body.color,
			heading:  req.body.heading,
			content:  req.body.content,
			position: req.body.position
		});
		board.tickets.push(ticket);
		board.save(function(err) {
			if(err) {
				return next(utils.error(500, err));
			}
			emitter.to(board.id).emit('ticket:create', {
				user:    req.user,
				tickets: [ ticket.toObject() ]
			});
			return res.json(201, ticket);
		});
	})
	.delete(middleware.authenticate('bearer'))
	.delete(middleware.relation('member', 'owner'))
	.delete(function(req, res, next) {
		var ids     = [ ]
		var removed = [ ]
		if(req.query.tickets) {
			ids = req.query.tickets.split(',');
		}
		var board = req.resolved.board;
		for(var i = 0; i < ids.length; i++) {
			var ticket = board.tickets.id(ids[i]);
			if(ticket) {
				ticket.remove();
				removed.push(ticket.toObject());
			}
			else return next(utils.error(400, 'Invalid parameters'));
		}
		board.save(function(err, board) {
			if(err) {
				if(err.name == 'VersionError') {
					return next(utils.error(409, err));
				}
				return next(utils.error(500, err));
			}
			emitter.to(board.id).emit('ticket:remove', {
				user:    req.user,
				tickets: removed
			});
			return res.json(200, removed);
		});
	});

Router.route('/:board_id/tickets/:ticket_id')
	.get(middleware.authenticate('bearer', 'anonymous'))
	.get(middleware.relation('*'))
	.get(function(req, res) {
		return res.json(200, req.resolved.ticket);
	})
	.put(middleware.authenticate('bearer'))
	.put(middleware.relation('member', 'owner'))
	.put(function(req, res, next) {
		var ticket          = req.resolved.ticket;
		    ticket.color    = req.body.color    || ticket.color;
		    ticket.heading  = req.body.heading  || ticket.heading;
		    ticket.content  = req.body.content  || ticket.content;
		    ticket.position = req.body.position || ticket.position;
		req.resolved.board.save(function(err, board) {
			if(err) {
				return next(utils.error(500, err));
			}
			emitter.to(board.id).emit('ticket:update', {
				user:    req.user,
				tickets: [ board.tickets.id(ticket.id).toObject() ]
			});
			return res.json(200, board.tickets.id(ticket.id));
		});
	})
	.delete(middleware.authenticate('bearer'))
	.delete(middleware.relation('member', 'owner'))
	.delete(function(req, res, next) {
		var board  = req.resolved.board;
		var ticket = req.resolved.ticket;
		board.tickets.remove({ _id: ticket.id });
		board.save(function(err, board) {
			if(err) {
				if(err.name == 'VersionError') {
					return next(utils.error(409, err));
				}
				return next(utils.error(500, err));
			}
			emitter.to(board.id).emit('ticket:remove', {
				user:    req.user,
				tickets: [ ticket.toObject() ]
			});
			return res.json(200, ticket);
		});
	});

Router.route('/:board_id/screenshot')
	.get(middleware.authenticate('bearer', 'anonymous'))
	.get(middleware.relation('*'))
	.get(function(req, res, next) {
		var url = config.static.url + ':' + config.static.port +
			'/boards' + req.path;
		return request.get(url, function(err) {
			if(err) {
				return res.send(503, 'screenshot-service unavailable');
			}
		}).pipe(res);
	});

module.exports = Router;
