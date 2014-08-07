/**
 * Entry point for the server application.
 *
 * @module  server
 */

'use strict';


// configure everything
var app      = require('./config/express');
var passport = require('./config/passport');
var mongoose = require('./config/mongoose');

// use authentication
app.use(passport.initialize());

// allow CORS
app.all('*', require('cors')({
	exposedHeaders: ['x-access-token']
}));

// setup API routes
app.use('/api/v1/auth',   require('./routes/auth'));
app.use('/api/v1/users',  require('./routes/user'));
app.use('/api/v1/boards', require('./routes/board'));

// setup static content
app.use('/static', require('express').static(__dirname + '/static'));

// handle errors with ~grace~
app.use(function(err, req, res, next) {
	var statusCode = err.status || res.statusCode || 500;

	if(statusCode < 400) {
		statusCode = 500;
	}

	err = require('boom').wrap(err, statusCode, err.message);
	return res.status(err.output.statusCode).send(err.output.payload);
});


/**
 * The ExpressJS application.
 */
module.exports.app = app;

/**
 * Starts listening to incoming connections.
 *
 * @param  {function}  onListen
 *
 * @example
 * var server = app.listen(function() {
 *   // server listening...
 * });
 */
module.exports.listen = function(onListen) {
	// setup maxSockets for http requests
	require('http').globalAgent.maxSockets = 512;

	// load common configuration
	var config = require('./config');

	// establish mongoose connection
	mongoose.connect(config.mongo.url, config.mongo.options);

	// start the server on configured port
	this.server = app.listen(config.port, onListen || function() {
		console.log('server listening at', config.port);
	});
}

/**
 * Shuts the server down.
 *
 * @param  {function}  onShutdown
 *
 * @example
 * app.shutdown(function() {
 *   // cleanup here...
 * });
 */
module.exports.shutdown = function(onShutdown) {
	// close the server and disconnect from mongoose
	return this.server.close(function() {
		mongoose.disconnect(onShutdown || function() {});
	});
}
