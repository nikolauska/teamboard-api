'use strict';

var credentials = {	'email': 'pekka@pouta.fi',
					'password': 'p0_uTa@p1l-vI' }

/**
 * Describes signing up for the service.
 */
module.exports = function(ctx) {
	return function() {

		it('should reject an empty email address', function(done) {
			this.app.post('/auth/register')
				.send({
					'email': 	'',
					'password': credentials.password
				})
				.expect(400, done);
		});

		it('should reject an invalid email address', function(done) {
			this.app.post('/auth/register')
				.send({
					'email':    'pekka',
					'password': credentials.password
				})
				.expect(400, done);
		});


		it('should reject an empty password', function(done) {
			this.app.post('/auth/register')
				.send({
					'email': 	credentials.email,
					'password': ''
				})
				.expect(400, done);
		});

		it('should accept valid credentials', function(done) {
			this.app.post('/auth/register')
				.send(credentials)
				.expect(201, function(err, res) {
					if(err) {
						return done(err);
					}

					ctx.user = res.body;
					ctx.credentials = {
						email: 'pekka@pouta.fi',
						password: 'p0_uTa@p1l-vI'
					}

					return done();
				});
		});

		it('should reject existing email address', function(done) {
		 	this.app.post('/auth/register')
	 			.send(credentials)
		 		.expect(400, done);
		});
	}
}
