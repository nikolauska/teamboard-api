'use strict';


module.exports = require('socket.io-emitter')(require('./index').redis);
