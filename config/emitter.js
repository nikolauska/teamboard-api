'use strict';

var config  = require('./index');
var emitter = require('socket.io-emitter');

module.exports = emitter(config.redis);
