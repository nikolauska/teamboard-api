'use strict';

/**
 * Simple wrapper for 'Error' to provide a HTTP status code.
 */
module.exports = function(status, message) {
	if(message instanceof Error) {
		message.status = status;
		return message;
	}
	var error        = new Error(message);
	    error.status = status;
	return error;
}
