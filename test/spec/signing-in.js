'use strict';

/**
 * Describes signing in to the service.
 */
module.exports = function(ctx) {
	return function() {
		it('should reject an invalid email address', function(done) {
			this.app.post('/auth/login')
				.send({
					'email':    'seppo@taalas.maa',
					'password': ctx.credentials.password
				})
				.expect(401, done);
		});

		it('should reject an invalid password', function(done)
{			this.app.post('/auth/login')
				.send({
					'email': 	ctx.credentials.email,
					'password': 'blaablablaa'
				})
				.expect(401, done);
		});


		it('should accept valid credentials', function(done) {
			this.app.post('/auth/login')
				.send(ctx.credentials)
				.expect(200, done);
		});

		it('should generate an access token', function(done) {
			this.app.post('/auth/login')
				.send(ctx.credentials)
				.expect(200, function(err, res) {
					if(err) {
						return done(err);
					}

					// TODO Can we validate the format of the access token?
					res.headers['x-access-token'].should.be.a.String;

					ctx.credentials.token = res.headers['x-access-token'];

					return done();
				});
		});
	}
}
