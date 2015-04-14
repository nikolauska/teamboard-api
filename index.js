'use strict'

console.log('Starting service...');
require('./server').listen(function() {
	console.log('Service started on port...', process.env.PORT);
});

