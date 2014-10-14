'use strict';

var app      = require('./config/express');
var mongoose = require('./config/mongoose');
var passport = require('./config/passport');

// Use 'passport' authentication.
app.use(passport.initialize());

// Attach 'CORS' middleware to every route.
app.all('*', require('cors')({
	exposedHeaders: ['x-access-token']
}));

// Setup the actual routes available.
app.use('/auth',   require('./routes/auth'));
app.use('/boards', require('./routes/board'));

/**
 * Error handling middleware. All errors passed to 'next' will eventually end
 * up here.
 *
 * TODO Review the error format.
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
 */
module.exports.listen = function(onListen) {
	var config = require('./config');

	mongoose.connect(
		config.mongo.url,
		config.mongo.options);

	this.server = app.listen(config.port, onListen || function() {
		console.log('server listening at', config.port);
	});
}

/**
 * Perform necessary teardown to stop the server.
 */
module.exports.shutdown = function(onShutdown) {
	return this.server.close(function() {
		mongoose.disconnect(onShutdown || function() {});
	});
}
