'use strict';

var utils      = require('../utils');
var middleware = require('../middleware');

var User   = require('mongoose').model('user');
var Router = require('express').Router();

Router.use(middleware.authenticate('bearer'));
Router.param('user_id', middleware.resolve.user());

Router.route('/')
	.get(function(req, res, next) {
		User.find(function(err, users) {
			if(err) {
				return next(utils.error(500, err));
			}
			return res.json(200, users);
		});
	});

Router.route('/:user_id')
	.get(function(req, res) {
		return res.json(200, req.resolved.user)
	});

module.exports = Router;
