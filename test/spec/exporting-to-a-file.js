'use strict';

module.exports = function(ctx) {
	return function() {

		it('should return a nested json structure', function(done) {
			var endpoint = '/api/boards/' + ctx.board.id + '/export';

			this.app.get(endpoint)
				.send({ 'access_token': ctx.credentials.token })
				.expect(200, function(err, res) {
					if(err) return done(err);

					var h = res.headers;

					h.should.have.property('content-disposition');
					h['content-disposition'].should.startWith('attachment;');

					res.body.should.be.an.Object;
					res.body.should.have.property('tickets');

					return done();
				});
		});
	}
}