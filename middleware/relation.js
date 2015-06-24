'use strict';

var _     = require('lodash');
var utils = require('../utils');

var _roles = {
	/**
	 * Check that the requestee is the 'user' that is admin of 'board'
	 * specified in 'req.resolved'.
	 */
	admin: function(req) {
		if(!req.user || !req.resolved.board) {
			return false;
		}
		var isUser    = req.user.type == 'standard';
		var hasAccess = false;

		if (req.resolved.board.members) {
			req.resolved.board.members.map(function (item) {
				if (item.user == req.user.id && item.role == 'admin') {
					hasAccess = true;
					return isUser && hasAccess;
				}
			})
		}

		return isUser && hasAccess;
	},

	/**
	 * Check that the requestee is the 'user' that has acces to 'board'
	 * specified in 'req.resolved'.
	 */
	user: function(req) {
		if(!req.user || !req.resolved.board) {
			return false;
		}

		var isUser    = req.user.type == 'standard';
		var hasAccess = false;

		if (req.resolved.board.members) {
			req.resolved.board.members.map(function (item) {
				if (item.user == req.user.id) {
					hasAccess = true;
					return isUser && hasAccess;
				}
			})
		}

		return isUser && hasAccess;
	},

	/**
	 * Check that the requestee is a 'guest' with access to the 'board'
	 * specified in 'req.resolved'.
	 */
	guest: function(req) {
		if(!req.user || !req.resolved.board) {
			return false;
		}

		var isGuest   = req.user.type   == 'temporary';
		var hasAccess = req.user.access == req.resolved.board.id;
		
		return isGuest && hasAccess;
	}
}

/**
 * Middleware to limit the access to 'boards' based on 'req.user' properties.
 * Note that this middleware is not generic in any way, and is dependent on the
 * 'resolve' middleware being invoked before this.
 *
 * TODO Can we dissolve some of the dependencies?
 */
module.exports = function() {
	var roles = [];

	// if the argument passed in is '*', run the all the checks
	if(arguments.length && arguments[0] == '*') {
		roles = _.keys(_roles);
	}
	else {
		for(var i = 0; i < arguments.length; i++) {
			roles.push(arguments[i]);
		}
	}

	return function(req, res, next) {
		// check the requesting user's role against the roles defined
		for(var i = 0; i < roles.length; i++) {
			if(_roles[roles[i]](req)) {
				return next();
			}
		}

		return next(utils.error(403, 'User did not match any role: ' +
			roles.join(', ') + '.'));
	}
}
