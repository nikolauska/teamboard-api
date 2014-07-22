'use strict';


var cluster = require('cluster');

if(cluster.isMaster) {

	var numcpu = require('os').cpus().length;

	for(var i = 0; i < numcpu; i++) {
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

	process.on('SIGINT', shutdown).on('SIGTERM', shutdown);

	server.listen(function() {
		console.log('Worker [', cluster.worker.id, '] listening');
	});
}
