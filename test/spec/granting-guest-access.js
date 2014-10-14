'use strict';

module.exports = function(ctx) {
	return function() {

		it.skip('should require authentication');
		it.skip('should require ownership of board');

		it('should generate an access code', function(done) {

			this.app.post('/boards/' + ctx.board.id + '/access')
				.send({ 'access_token': ctx.credentials.token })
				.expect(200, function(err, res) {
					if(err) {
						return done(err);
					}

					ctx.board.accessCode = res.body.accessCode;

					return done();
				});
		});

		it('should generate an access token', function(done) {

			var endpoint = '/boards/' + ctx.board.id +
				'/access/' + ctx.board.accessCode

			this.app.post(endpoint)
				.expect(200, function(err, res) {
					if(err) {
						return done(err);
					}

					ctx.credentials.guest = res.headers['x-access-token'];

					return done();
				});
		});
	}
}
