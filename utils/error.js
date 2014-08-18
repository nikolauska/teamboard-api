'use strict';

// TODO Refactor router code to just use 'boom' for errors
module.exports = function(status, message) {
	if(message instanceof Error) {
		message.status = status;
		return message;
	}
	var error        = new Error(message);
	    error.status = status;
	return error;
}
