'use strict';

var promise   = require('promise');

var credentials = {
	'email': 	'pekka.pouta@pilvi.fi',
	'password': 'abc12!"#$%&\'()*+,-./:;<=>?@[]^_`{|}~'
}

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

		it('should reject an invalid password', function(done) {
			var payloads = [];
			var promises = [];
			var app = this.app

			function postPassword(payload) {
				return new promise(function(resolve, reject) {
					app.post('/auth/register')
						.send({
							'email':    credentials.email,
							'password': payload
						})
						.expect(400, function(err, res) {
							if(err) {
								reject(err);
							}
							else {
								resolve(res);
							}
						});
				});
			}

			for(var i = 0; i <= 224; i++) {
				if(i < 33 || i > 126) {
					payloads.push('salasana_' + i + String.fromCharCode(i));
				}
			}

			for(var i = 0; i < payloads.length; i++) {
				promises.push(postPassword(payloads[i]));
			}

			promise.all(promises).then(
				function(res) {
					return done();
				},
				function(err) {
					return done(err);
				});
		});

		it('should reject passwords under 8 characters', function(done) {
			this.app.post('/auth/register')
				.send({
					'email':    credentials.email,
					'password': 'abcdefg'
				})
				.expect(400, done);
		});

		it('should reject passwords over 36 characters', function(done) {
			this.app.post('/auth/register')
				.send({
					'email':    credentials.email,
					'password': 'abcdefghijklmnopqrstuvwxyzabcdefghijk'
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
						email: credentials.email,
						password: credentials.password
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
