'use strict';


var utils    = require('../utils');
var passport = require('passport');
var mongoose = require('mongoose');

module.exports = function() {
	return function(req, res, next) {

		// TODO make this into a separate passport-strategy?
		if(req.header('x-guest-secret')) {

			mongoose.model('guest').find({
					secret: req.header('x-guest-secret')
				},
				function(err, guests) {

					if(err) {
						return next(utils.error(401, err));
					}
					else if(!guests[0]) {
						return next(utils.error(401, 'Guest not found'));
					}

					req.user      = guests[0];
					req.user.role = 'guest';

					return next();
				});
		}
		else {

			var onAuthenticated = function(err, user) {

				if(err) {
					return next(utils.error(401, err));
				}
				else if(!user) {
					return next(utils.error(401, 'User not found'));
				}

				req.user      = user;
				req.user.role = 'user';

				return next();
			}

			return passport.authenticate(
				'bearer', { session: false }, onAuthenticated)(req, res);
		}
	}
}
