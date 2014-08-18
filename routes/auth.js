'use strict';

var jwt        = require('jsonwebtoken');
var utils      = require('../utils');
var config     = require('../config');
var passport   = require('passport');
var middleware = require('../middleware');

var User   = require('mongoose').model('user');
var Router = require('express').Router();

Router.route('/')
	.all(middleware.authenticate('bearer'))
	.get(function(req, res) {
		return res.json(200, req.user);
	});

Router.route('/login')
	.post(function(req, res, next) {
		var onauthenticated = function(err, user) {
			if(err) {
				return next(utils.error(401, err));
			}
			var gentoken = function(user, callback) {
				user.token = jwt.sign({ id: user.id }, config.token.secret,
					{ expiresInMinutes: config.token.expiration });
				user.save(function(err, user) {
					if(err) {
						return next(utils.error(500, err));
					}
					return callback(user);
				});
			}
			var onlogin = function(user) {
				res.set('x-access-token', user.token);
				res.json(200, user);
			}
			if(user.token) {
				jwt.verify(user.token, config.token.secret, function(err) {
					if(err) {
						return gentoken(user, onlogin);
					}
					return onlogin(user);
				});
			}
			else {
				return gentoken(user, onlogin);
			}
		}
		return passport.authenticate(
			'local', { session: false }, onauthenticated)(req, res);
	});

Router.route('/logout')
	.all(middleware.authenticate('bearer'))
	.post(function(req, res, next) {
		req.user.token = null;
		req.user.save(function(err) {
			if(err) {
				return next(err);
			}
			return res.send(200);
		});
	});

Router.route('/register')
	.post(function(req, res, next) {
		var user = new User({
			email:    req.body.email,
			password: req.body.password
		});
		user.save(function(err, user) {
			if(err) {
				return next(err);
			}
			return res.json(201, user);
		});
	});

module.exports = Router;
