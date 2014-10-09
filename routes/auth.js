'use strict';

var jwt      = require('jsonwebtoken');
var boom     = require('boom');
var passport = require('passport');

var utils      = require('../utils');
var config     = require('../config');
var middleware = require('../middleware');

var User   = require('mongoose').model('user');
var Router = require('express').Router();

Router.route('/')

	/**
	 * Get the user details based on the 'type' of the user. In a sense, returns
	 * the user deserialized from the token.
	 *
	 * {
	 *   'id':       user.id,
	 *   'type':     user | guest
	 *   'access':   board.id
	 *   'username': user.email | guest.username
	 * }
	 */
	.get(middleware.authenticate('user', 'guest'))
	.get(function(req, res) {
		return res.json(200, req.user);
	});

Router.route('/login')

	/**
	 * Exchange an 'access-token' for valid credentials. If the user already
	 * has a token (and it is still valid), it is reused. Otherwise a new token
	 * is generated for the user.
	 *
	 * {
	 *   'email':    user.email,
	 *   'password': user.password
	 * }
	 */
	.post(function(req, res, next) {
		var onAuthentication = function(err, user) {
			if(err) {
				return next(error(401, err));
			}

			var respond = function(token, payload) {
				return res.set('x-access-token', token).json(200, payload);
			}

			var createToken = function(user) {
				var userPayload = {
					id:       user.id,
					type:     'user',
					username: user.email
				}

				user.token = jwt.sign(userPayload, config.token.secret);
				user.save(function(err, user) {
					if(err) {
						return next(error(500, err));
					}
					return respond(user.token, userPayload);
				});
			}

			if(user.token) {
				// if the token is not valid anymore but correct credentials
				// were provided, generate a new token for the user
				jwt.verify(user.token, config.token.secret,
					function(err, payload) {
						if(err) {
							return createToken(user);
						}
						return respond(user.token, payload);
					});
			}
			else return createToken(user);
		}

		return passport.authenticate(
			'local', { session: false }, onAuthentication)(req, res);
	});

Router.route('/logout')

	/**
	 * Removes the 'access-token' stored in database in order to invalidate it.
	 */
	.post(middleware.authenticate('user'))
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

	/**
	 * Creates a new 'user' account.
	 *
	 * {
	 *   'email':    'narsu@man.fi',
	 *   'password': 'sikapossu'
	 * }
	 */
	.post(function(req, res, next) {
		new User({ email: req.body.email, password: req.body.password })
			.save(function(err, user) {
				if(err) {
					return next(err);
				}
				return res.json(201, user);
			});
	});

module.exports = Router;
