'use strict';

var config   = require('./config');
var app      = require('./config/express');
var mongoose = require('./config/mongoose');
var passport = require('./config/passport');

// Use 'passport' authentication.
app.use(passport.initialize());

// Attach 'CORS' middleware to every route.
app.all('*', require('cors')({
	exposedHeaders: ['x-access-token']
}));

// Setup API Routes.
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/board'));

/**
 * Error handling middleware. All errors passed to 'next' will eventually end
 * up here.
 */
app.use(function(err, req, res, next) {
	var boom = require('boom');
	    err  = boom.wrap(err, err.status);
	if(err.output.statusCode >= 500) {
		console.error(err);
	}
	return res.status(err.output.statusCode).send(err.output.payload);
});

/**
 * The Express application.
 */
module.exports.app = app;

/**
 * Perform necessary initialization to start the server.
 *
 * @param  {function}  onListen  Callback invoked when the server starts
 *                               listening to incoming requests.
 */
module.exports.listen = function(onListen) {

	var connectWithRetry = function() {
		mongoose.connect(config.mongo.url, config.mongo.opts, function (err) {
			if(err) {
				console.error(err);
				console.log("Reconnecting in " + config.mongo.timeout + " ms...");
				setTimeout(connectWithRetry, config.mongo.timeout);
			}
		});
	}

	mongoose.connection.on('error', function(error) {
		console.error('Error during MongoDB runtime! ' + error);
	});

	mongoose.connection.on('connected', function() {
		console.log('Connected to MongoDB!');
	});

	connectWithRetry();

	this.server = app.listen(config.port, onListen || function() {
		console.log('server listening at', config.port);
	});
}

/**
 * Perform necessary teardown to stop the server.
 *
 * @param  {function=}  onShutdown  Callback invoked after shutting down.
 */
module.exports.shutdown = function(onShutdown) {
	return this.server.close(function() {
		mongoose.disconnect(onShutdown || function() {});
	});
}
