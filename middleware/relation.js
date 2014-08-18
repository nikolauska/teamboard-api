'use strict';

var _     = require('lodash');
var utils = require('../utils');

var _roles = {
	anonymous: function(req) {
		if(req.resolved.board) {
			return req.resolved.board.isPublic;
		}
		return false;
	},
	member: function(req) {
		if(!req.user || !req.resolved.board) {
			return false;
		}
		return req.resolved.board.isMember(req.user);
	},
	owner: function(req) {
		if(!req.user || !req.resolved.board) {
			return false;
		}
		return req.resolved.board.isOwner(req.user);
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
		return next(utils.error(403,
			'User did not match any role: ' + roles.join(', ') + '.'));
	}
}
