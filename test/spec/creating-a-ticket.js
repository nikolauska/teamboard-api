'use strict';

/**
 * Describes creating a Ticket.
 */
module.exports = function(ctx) {
	return function() {

		it('should require authentication', function(done) {
			this.app.post('/boards/' + ctx.board.id + '/tickets').expect(401, done);
		});

		it('should require an existing board', function(done) {
			var id = require('mongoose').Types.ObjectId();

			this.app.post('/boards/' + id + '/tickets')
				.send({ 'access_token': ctx.user.token }).expect(404, done);
		});

		it.skip('should require access to board');

		it.skip('should initialize the ticket to valid defaults', function(done) {

		});
	}
}
