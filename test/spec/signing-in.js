'use strict';

/**
 * Describes signing in to the service.
 */
module.exports = function() {

	it('should require a valid account', function(done) {
		this.app.post('/auth/login')
		.send({
			'email':    'seppo@taalas.maa',
			'password': 'isanta'
		})
		.expect(401, done);
	});

	// TODO Cover the case of having partially correct credentials.

	it('should generate an access token', function(done) {
		this.app.post('/auth/login')
			.send(this.user)
			.expect(200, function(err, res) {
				if(err) {
					return done(err);
				}

				// TODO Can we validate the format of the access token?
				res.headers['x-access-token'].should.be.a.String;

				return done();
			});
	});

}
