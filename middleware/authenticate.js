'use strict';

var passport = require('passport');

/**
 * Create an authentication middleware function for given strategies.
 *
 * Attaches a 'user' object in the 'req' object. The attached 'user' is of the
 * following format:
 *
 * {
 *   'id':       user.id
 *   'type':     user | guest
 *   'username': user.email | guest.username
 *   'access':   board.id
 * }
 *
 * The 'id' field will be present when 'type' is set to 'user', and the
 * 'access' field will be present when 'type' is set to 'guest'.
 *
 * @param  {...string}  strategies  Strategies passed to 'passport'.
 *
 * @returns  {function}  Authentication middleware.
 */
module.exports = function() {
	var strategies = [ ];
	for(var i = 0; i < arguments.length; i++) {
		strategies.push(arguments[i]);
	}
	return passport.authenticate(strategies, {
		session:       false,
		failWithError: true,
	});
}
