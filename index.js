'use strict'

var server = require('./server');
var config = require('./config');

console.log('Starting service...');

server.listen(function() {
	console.log('Service started on port...', config.port);
});
