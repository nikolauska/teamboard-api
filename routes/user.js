'use strict';


var router = require('express').Router();

var utils      = require('../utils');
var middleware = require('../middleware');

var User = require('mongoose').model('user');

// protect this resource behind authentication
router.use(middleware.authenticate());

// find the user matching the id
// make user available to following middleware
router.param('user_id', middleware.resolve.user());

// setup http-methods for route /users
router.route('/')
	.get(function(req, res, next) {
		User.find(utils.err(next, function(users) {
			return res.json(200, users);
		}));
	});

// setup http-methods for route /users/user_id
router.route('/:user_id')
	.get(function(req, res) {
		return res.json(200, req.resolved.user)
	});


module.exports = router;
