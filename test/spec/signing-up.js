'use strict';

/**
 * Describes signing up for the service.
 */
module.exports = function() {

	it('should reject an empty email address', function(done) {
		this.app.post('/auth/register')
			.send({
				'email': 	"",
				'password': "pouta"
			})
			.expect(400, done);
	});

	it('should reject an invalid email address', function(done) {
		this.app.post('/auth/register')
			.send({
				'email':    'pekka',
				'password': 'pouta'
			})
			.expect(400, done);
	});

	it('should reject an empty password', function(done) {
		this.app.post('/auth/register')
			.send({
				'email': 	"pekka@pouta.fi",
				'password': "" 
			})
			.expect(400, done);
	});

	it('should accept valid credentials', function(done) {
		this.app.post('/auth/register')
			.send({
				'email': 	"pekka@pouta.fi", 
				'password': "pouta"
			})
			.expect(201, done);
	});

	it('should reject existing email address', function(done) {
		this.app.post('/auth/register')
			.send({
				'email': 	"pekka@pouta.fi", 
				'password': "pouta"
			})
			.expect(400, done);
	});


	// TODO Cover most of the validation cases.

}
