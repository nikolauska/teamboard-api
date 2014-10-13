// 'use strict';

// /**
//  * TODO Refactor into 'cases'. Like 'Logging in' and 'Siging up'.
//  */

// /**
//  * Authentication
//  */
// describe('/auth', function() {

// 	/**
// 	 * Signing up.
// 	 */
// 	describe('/auth/register', function() {
// 		describe('POST', function() {

// 			it('should reject a invalid emails', function(done) {
// 				this.app.post('/auth/register')
// 					.send({
// 						'email':    'pekka',
// 						'password': 'pouta'
// 					})
// 					.expect(400, done);
// 			});

// 			// TODO Cover most of the validation cases.
// 		});
// 	});

// 	/**
// 	 * Logging in.
// 	 */
// 	describe('/auth/login', function() {
// 		describe('POST', function() {

// 			it('should require a valid account', function(done) {
// 				this.app.post('/auth/login')
// 					.send({
// 						'email':    'seppo@taalas.maa',
// 						'password': 'isanta'
// 					})
// 					.expect(401, done);
// 			});

// 			// TODO Cover the case of having partially correct credentials.

// 			it('should generate an access token', function(done) {
// 				this.app.post('/auth/login')
// 					.send(this.user)
// 					.expect(200, function(err, res) {
// 						if(err) {
// 							return done(err);
// 						}

// 						// TODO Can we validate the format of the access token?
// 						res.headers['x-access-token'].should.be.a.String;

// 						return done();
// 					});
// 			});
// 		});
// 	});

// 	/**
// 	 * Logging out.
// 	 */

// 	// TODO Cover the case of 'guest-token'.
// });
