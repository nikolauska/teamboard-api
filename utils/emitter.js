'use strict';

var redis   = require('redis');
var emitter = require('socket.io-emitter');
var config  = require('../config');

console.log(config.redis);

var client = redis.createClient(
	config.redis.port, config.redis.host, config.redis.opts
);

module.exports = emitter(client);
