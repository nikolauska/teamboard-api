'use strict';

var redis   = require('redis');
var emitter = require('socket.io-emitter');
var config  = require('../config');

var client = redis.createClient(
	config.redis.port, config.redis.host, config.redis.opts
);

client.on('ready', function() {
	console.log('Connected to Redis!');
});

client.on('error', function(err) {
	console.log(err);
});

module.exports = emitter(client);
