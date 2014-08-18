'use strict';

// TODO What if message instanceof Error, Error.status != null?
//      Maybe log this as warning and keep old error-code (model validation).
module.exports = function(status, message) {
	if(message instanceof Error) {
		message.status = status;
		return message;
	}
	var error        = new Error(message);
	    error.status = status;
	return error;
}
