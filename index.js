'use strict';

var os      = require('os');
var cluster = require('cluster');

if(cluster.isMaster) {
	for(var i = 0; i < os.cpus().length; i++) {
		cluster.fork();
	}
}
else {
	var server = require('./server');

	var shutdown = function() {
		server.shutdown(function() {
			console.log('Worker [', cluster.worker.id, '] going down...');
			process.exit(0);
		});
	}

	process
		.on('SIGINT',  shutdown)
		.on('SIGTERM', shutdown);

	server.listen(function() {
		console.log('Worker [', cluster.worker.id, '] listening');
	});
}
