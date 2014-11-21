'use strict';

var passport = require('passport');

/**
 * Authenticates the request using the given strategies.
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
 */
module.exports = function() {
	var strategies = [];
	for(var i = 0; i < arguments.length; i++) {
		strategies.push(arguments[i]);
	}
	return passport.authenticate(strategies, {
		session:       false,
		failWithError: true,
	});
}
