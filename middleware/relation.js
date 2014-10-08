'use strict';

var _     = require('lodash');
var error = require('../utils/error');

var _roles = {

	user: function(req) {
		if(!req.user || !req.resolved.board) {
			return false;
		}

		var isUser    = req.user.type    == 'user';
		var isCreator = req.user.user_id == req.resolved.board.createdBy;

		return isUser && isCreator;
	},

	guest: function(req) {
		if(!req.user || !req.resolved.board) {
			return false;
		}

		var isGuest   = req.user.type     == 'guest';
		var isVisitor = req.user.board_id == req.resolved.board.id;

		return isGuest && isVisitor;
	}
}

module.exports = function() {
	var roles = [ ];
	if(arguments.length && arguments[0] == '*') {
		roles = _.keys(_roles);
	}
	else {
		for(var i = 0; i < arguments.length; i++) {
			roles.push(arguments[i]);
		}
	}
	return function(req, res, next) {
		for(var i = 0; i < roles.length; i++) {
			if(_roles[roles[i]](req)) {
				return next();
			}
		}
		return next(error(403, 'User did not match any role: ' +
			roles.join(', ') + '.'));
	}
}
