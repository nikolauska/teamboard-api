'use strict';


var authenticate = require('./authenticate')();

module.exports = function() {
	return function(req, res, next) {
		authenticate(req, res, function(err) {
			if(err) {
				if(err.status === 401) {
					req.anonymous = true;
				}
				else {
					return next(err);
				}
			}
			return next();
		});
	}
}
