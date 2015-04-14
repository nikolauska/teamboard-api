'use strict'

require('./server').listen(function() {
	console.log('Service started on port...', process.env.PORT);
});
