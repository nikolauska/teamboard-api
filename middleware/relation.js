'use strict';


var _roles = {

	// this role also acts as a gateway to view public boards, eg.
	// if the user is registered but in no way affiliated with the board
	// he or she will still be able to view public boards
	anonymous: function(req) {
		if(req.resolved.board) {
			return req.resolved.board.isPublic;
		}
		return false;
	},

	guest: function(req) {

		if(!req.user || !req.resolved.board) {
			return false;
		}

		var isGuest = req.user.role === 'guest' &&
		    req.resolved.board.isGuest(req.user);

		return isGuest;
	},

	member: function(req) {

		if(!req.user || !req.resolved.board) {
			return false;
		}

		var isUser   = req.user.role === 'user';
		var isMember = req.resolved.board.isMember(req.user);

		return isUser && isMember;
	},

	owner: function(req) {

		if(!req.user || !req.resolved.board) {
			return false;
		}

		var isUser  = req.user.role === 'user';
		var isOwner = req.resolved.board.isOwner(req.user);

		return isUser && isOwner;
	}
}

module.exports = function() {

	var roles = [ ];

	if(arguments.length && arguments[0] == '*') {
		roles = require('lodash').keys(_roles);
	}
	else {
		for(var i = 0; i < arguments.length; i++) {
			roles.push(arguments[i]);
		}
	}

	return function(req, res, next) {
		for(var i = 0; i < roles.length; i++) {
			if(_roles[roles[i]] && _roles[roles[i]](req)) return next();
		}
		return next(require('../utils').error(403,
			'User did not match roles: ' + roles.join(', ') + '.'));
	}
}
