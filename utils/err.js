'use strict';


module.exports = function(onError, onSuccess) {
	return function(err, resource) {

		if(err) {
			return onError(err);
		}

		if(!resource) {
			return onError(new Error('Missing resource'));
		}

		return onSuccess(resource);
	}
}
