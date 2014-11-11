'use strict';

module.exports = function(ctx) {
	return function() {

		it('should default to a json file', function(done) {
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

		it('should support csv format', function(done) {
			var endpoint = '/api/boards/' + ctx.board.id + '/export?format=csv';

			this.app.get(endpoint)
				.send({ 'access_token': ctx.credentials.token })
				.expect(200, function(err, res) {
					if(err) return done(err);

					var h = res.headers;

					h.should.have.property('content-disposition');
					h['content-type'].should.startWith('text/csv');
					h['content-disposition'].should.startWith('attachment;');

					return done();
				});
		});
	}
}
