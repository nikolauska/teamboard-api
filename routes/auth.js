'use strict';

var jwt      = require('jsonwebtoken');
var passport = require('passport');

var utils      = require('../utils');
var config     = require('../config');
var middleware = require('../middleware');

var User   = require('mongoose').model('user');
var Router = require('express').Router();

Router.route('/auth')

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

Router.route('/auth/login')

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
	.post(middleware.authenticate('local'))
	.post(function(req, res, next) {
		// The secret used to sign the 'jwt' tokens.
		var secret = config.token.secret;

		// Find the user specified in the 'req.user' payload. Note that
		// 'req.user' is not the 'user' model.
		User.findOne({ _id: req.user.id }, function(err, user) {
			if(err) {
				return next(utils.error(500, err));
			}

			// Make sure the token verified is not undefined. An empty string
			// is not a valid token so this 'should' be ok.
			var token = user.token || '';
			jwt.verify(token, secret, function(err, payload) {
				// If there was something wrong with the existing token, we
				// generate a new one since correct credentials were provided.
				if(err) {
					var payload = {
						id: user.id, type: 'user', username: user.email
					}

					user.token = jwt.sign(payload, secret);
					user.save(function(err, user) {
						if(err) {
							return next(utils.error(500, err));
						}
						return res.set('x-access-token', user.token)
							.json(200, payload);
					});
				}
				// If the token was valid we reuse it.
				else return res.set('x-access-token', user.token)
					.json(200, payload);
			});
		});
	});

Router.route('/auth/logout')

	/**
	 * Removes the 'access-token' stored in database in order to invalidate it.
	 */
	.post(middleware.authenticate('user'))
	.post(function(req, res, next) {
		User.findOne({ '_id': req.user.id }, function(err, user) {
			if(err) {
				return next(utils.error(500, err));
			}

			if(!user) {
				return next(utils.error(404, 'User not found'));
			}

			user.token = null;
			user.save(function(err) {
				return err ? next(err) : res.send(200);
			});
		});
	});

Router.route('/auth/register')

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
					// TODO Make sure the type of 'err' is 'ValidationError' if
					//      we are sending a '400' response.
					return next(utils.error(400, err));
				}
				return res.json(201, user);
			});
	});

module.exports = Router;
