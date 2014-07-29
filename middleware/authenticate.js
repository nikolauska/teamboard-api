'use strict';


var utils    = require('../utils');
var passport = require('passport');
var mongoose = require('mongoose');

module.exports = function() {

	var strategyMap = {
		'user':      'bearer',
		'anonymous': 'anonymous'
	}

	var strategies = [ ]

	for(var i = 0; i < arguments.length; i++) {
		strategies.push(strategyMap[arguments[i]]);
	}

	return passport.authenticate(strategies, { session: false });
}
