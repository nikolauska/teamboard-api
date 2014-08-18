'use strict';

var app      = require('./config/express');
var mongoose = require('./config/mongoose');
var passport = require('./config/passport');

// use authentication
app.use(passport.initialize());

// allow CORS for everything
app.all('*', require('cors')({
	exposedHeaders: ['x-access-token']
}));

// setup API routes
app.use('/api/v1/auth',   require('./routes/auth'));
app.use('/api/v1/users',  require('./routes/user'));
app.use('/api/v1/boards', require('./routes/board'));

// catch errors and format them properly
app.use(function(err, req, res, next) {
	var boom = require('boom');
	    err  = boom.wrap(err, err.status);
	if(err.status >= 500) {
		console.error(err);
	}
	return res.status(err.output.statusCode).send(err.output.payload);
});

module.exports.app = app;

module.exports.listen = function(onListen) {
	var config = require('./config');

	mongoose.connect(
		config.mongo.url,
		config.mongo.options);

	this.server = app.listen(config.port, onListen || function() {
		console.log('server listening at', config.port);
	});
}

module.exports.shutdown = function(onShutdown) {
	return this.server.close(function() {
		mongoose.disconnect(onShutdown || function() {});
	});
}
