'use strict';

module.exports = function(ctx) {
	return function() {

		it('should return a list of events', function(done) {
			this.app.get('/api/boards/' + ctx.board.id + '/events')
				.send({ 'access_token': ctx.credentials.token })
				.expect(200, function(err, res) {
					if(err) return done(err);
					res.body.should.be.an.Array;
					return done();
				});
		});

		it.skip('should allow guest-access');
	}
}