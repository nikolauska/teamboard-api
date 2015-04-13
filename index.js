'use strict'

console.log('Starting service on port...', process.env.PORT);

require('./server').listen(function() {
	console.log('Service started on port...', process.env.PORT);
});
