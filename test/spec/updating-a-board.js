'use strict';

/**
 * Describes updating a Board.
 */
module.exports = function(ctx) {
	return function() {

		it('should require authentication', function(done) {
			this.app.put('/api/boards/' + ctx.board.id + '')
				.expect(401, done);
		});

		it('should return the updated board', function(done) {
			this.app.put('/api/boards/' + ctx.board.id + '')
				.send({ 'access_token': ctx.credentials.token })
				.send({
					'size': {
						'width': 16, 'height': 10
					},
					'description': 'I was changed.',
				})
				.expect(200, done);
		});
	}
}
