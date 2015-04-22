'use strict';

var emitter = require('socket.io-emitter');

/**
 * Exports the 'socket.io-emitter' ready configured to use 'redis'.
 */
module.exports = emitter(require('../config').redis);
