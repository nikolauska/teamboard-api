'use strict';

var passport = require('passport');

module.exports = function() {
	var strategies = [ ]
	for(var i = 0; i < arguments.length; i++) {
		strategies.push(arguments[i]);
	}
	return passport.authenticate(strategies, { session: false });
}
