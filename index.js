'use strict';

var os      = require('os');
var cluster = require('cluster');

// Fork worker processes to each CPU core.
if(cluster.isMaster) {
	for(var i = 0; i < os.cpus().length; i++) {
		cluster.fork();
	}
}
// Run the forked worker process.
else {
	var server = require('./server');

	/**
	 * Attempt some form of cleanup when the process is killed.
	 */
	var shutdown = function() {
		server.shutdown(function() {
			console.log(
				'Worker [', cluster.worker.process.pid, '] going down...');
			process.exit(0);
		});
	}

	// Kill the process on 'SIGINT' and 'SIGTERM' signals.
	process.on('SIGINT', shutdown).on('SIGTERM', shutdown);

	// Start the server application on this worker process.
	server.listen(function() {
		console.log('Worker [', cluster.worker.process.pid, '] listening');
	});
}
