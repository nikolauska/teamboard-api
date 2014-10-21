'use strict';

module.exports = function(ctx) {
	return function() {

		it.skip('should require authentication');

		it('should revoke all existing tokens', function(done) {

			var app = this.app;

			app.delete('/api/boards/' + ctx.board.id + '/access')
				.send({ 'access_token': ctx.credentials.token })
				.expect(200, function(err, res) {
					if(err) {
						return done(err);
					}

					app.post('/api/boards/' + ctx.board.id + '/tickets')
						.send({ 'access_token': ctx.credentials.guest })
						.send({ 'heading': 'i will never exist' })
						.expect(401, done);
				});
		});
	}
}
