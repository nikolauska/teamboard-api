'use strict';

var redis   = require('redis');
var emitter = require('socket.io-emitter');

var host = process.env.REDIS_HOST;
var port = process.env.REDIS_PORT;
var pass = process.env.REDIS_PASS;

module.exports = emitter(redis.createClient(port, host, { auth_pass: pass }));
