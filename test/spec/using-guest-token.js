'use strict';


module.exports = function(ctx) {
	return function() {

		it('should not allow \'user\' level actions', function(done) {
			this.app.post('/boards')
				.send({ 'access_token': ctx.credentials.guest })
				.send({ 'name': 'i will never exist in your world' })
				.expect(401, done);
		});

		it('should allow creating tickets', function(done) {
			this.app.post('/boards/' + ctx.board.id + '/tickets')
				.send({ 'access_token': ctx.credentials.guest })
				.send({ 'heading': 'diged heding' })
				.expect(201, done);
		});
	}
}