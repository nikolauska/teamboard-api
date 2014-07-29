'use strict';


var jwt      = require('jsonwebtoken');
var router   = require('express').Router();
var passport = require('passport');

var utils      = require('../utils');
var config     = require('../config');
var middleware = require('../middleware');

// setup http-methods for route /auth
router.route('/')
	.all(middleware.authenticate('bearer'))
	.get(function(req, res) {
		return res.json(200, req.user);
	});

// setup http-methods for route /auth/login
router.route('/login')
	.post(function(req, res, next) {

		// callback for local authentication
		var onAuthenticated = function(err, user) {

			if(err) {
				return next(utils.error(401, err));
			}

			// generate unique token for the user
			user.token = jwt.sign({ id: user.id }, config.token.secret,
				{ expiresInMinutes: config.token.expiration });

			// store generated token in db for further authentication
			user.save(utils.err(next, function(user) {
				res.set('x-access-token', user.token);
				return res.json(200, user);
			}));
		}

		// authenticate using the passport local strategy
		return passport.authenticate(
			'local', { session: false }, onAuthenticated)(req, res);
	});

// setup http-methods for route /auth/logout
router.route('/logout')
	.all(middleware.authenticate('bearer'))
	.post(function(req, res, next) {

		// remove the stored token, causing subsequent
		// authentication using it to fail
		req.user.token = null;
		req.user.save(utils.err(next, function() {
			return res.send(200);
		}));
	});

// setup http-methods for route /auth/register
router.route('/register')
	.post(function(req, res, next) {

		// password is handled with bcrypt
		// TODO add some form of email validation
		// TODO generate pseudo random string that is sent to email
		var User = require('mongoose').model('user');
		var user = new User({
			email:    req.body.email,
			password: req.body.password
		});

		// persist the user in db
		// TODO make sure unactivated accounts cannot login
		res.status(400);
		user.save(utils.err(next, function(user) {
			return res.json(201, user);
		}));
	});

module.exports = router;
