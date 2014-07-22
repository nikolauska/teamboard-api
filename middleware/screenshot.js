'use strict';


module.exports = function() {
	return function(req, res, next) {
		req.resolved.board.updateScreenShot(next);
	}
}
