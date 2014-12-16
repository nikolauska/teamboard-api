'use strict';

var emitter = require('socket.io-emitter')(require('../config').redis);

/**
 * Unhandled 'error' events get turned into uncaught expections, so we need to
 * handle this.
 */
emitter.redis.on('error', function onError(err) {
	return console.error('redis ::', err);
});

emitter.redis.on('ready', function onReady() {
	return console.log('redis :: connected');
});

/**
 * Exports the 'socket.io-emitter' ready configured to use 'redis'.
 */
module.exports = emitter;
