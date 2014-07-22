'use strict';


var utils = require('../utils');

module.exports = function() {
	return function(req, res, next) {
		if(req.user && req.user.role === 'user') {
			return next();
		}
		else return next(utils.error(403,
			'Only registered users can do that!'));
	}
}
