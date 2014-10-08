'use strict';

var jwt        = require('jsonwebtoken');
var boom       = require('boom');
var error      = require('../utils/error');
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
				return next(error(401, err));
			}

			// generates and stores a token for the given user
			var gentoken = function(user, callback) {
				user.token = jwt.sign({ id: user.id }, config.token.secret,
					{ expiresInMinutes: config.token.expiration });
				user.save(function(err, user) {
					if(err) {
						return next(error(500, err));
					}
					return callback(user);
				});
			}

			// respond to login request with correct headers and stuff
			var onlogin = function(user) {
				res.set('x-access-token', user.token);
				res.json(200, user);
			}

			if(user.token) {
				// check that the token is still valid, if not then generate
				// and store a new one then login the user
				jwt.verify(user.token, config.token.secret, function(err) {
					if(err) {
						return gentoken(user, onlogin);
					}
					return onlogin(user);
				});
			}
			else {
				// generate and store a new token, login the user
				return gentoken(user, onlogin);
			}
		}
		return passport.authenticate(
			'local', { session: false }, onauthenticated)(req, res);
	});

Router.route('/logout')
	.all(middleware.authenticate('bearer'))
	.post(function(req, res, next) {
		// remove active token
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
		// TODO Add email-based activation?
		//      Maybe make it configurable?
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
