'use strict';

/**
 * Simple utility that enhances the given error with a 'status' field.
 *
 * @param  {Number}          status   HTTP status code.
 * @param  {(String|Error)}  message  Message describing the error, can also be
 *                                    an instance of Error.
 *
 * @returns  {Error}  Error object enhanced with a 'status'.
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
