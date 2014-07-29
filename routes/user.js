'use strict';


var User = require('mongoose').model('user');

var utils      = require('../utils');
var middleware = require('../middleware');

var router = require('express').Router();

router.use(middleware.authenticate('user'));
router.param('user_id', middleware.resolve.user());

router.route('/')
	.get(function(req, res, next) {
		User.find(utils.err(next, function(users) {
			return res.json(200, users);
		}));
	});

router.route('/:user_id')
	.get(function(req, res) {
		return res.json(200, req.resolved.user)
	});


module.exports = router;
