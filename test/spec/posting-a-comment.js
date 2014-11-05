'use strict';

module.exports = function(ctx) {
	return function() {

		it('should return the created event', function(done) {
			var endpoint = '/api/boards/' + ctx.board.id + '/tickets/' +
				ctx.ticket.id + '/comments';

			this.app.post(endpoint)
				.send({ 'access_token': ctx.credentials.token })
				.send({ 'comment': 'nice ticket john' })
				.expect(201, function(err, res) {
					if(err) return done(err);

					res.body.should.be.an.Object;
					// TODO...

					return done();
				});
		});

		it('should persist the created event', function(done) {
			var endpoint = '/api/boards/' + ctx.board.id + '/tickets/' +
				ctx.ticket.id + '/comments';

			this.app.get(endpoint)
				.send({ 'access_token': ctx.credentials.token })
				.expect(200, function(err, res) {
					if(err) return done(err);

					res.body.should.be.an.Array;
					// TODO...

					return done();
				});
		});
	}
}