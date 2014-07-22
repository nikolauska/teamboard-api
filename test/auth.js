'use strict';


describe('routes/auth', function() {

	describe('GET /auth', function() {
		it.skip('should require authentication')
		it.skip('should return user identified by token');
	});

	describe('POST /auth/login', function() {

		var test_auth_user = null;

		before(function(done) {

			var User = require('mongoose').model('user');

			new User({ email: 'auth@auth.auth', password: 'test' })
				.save(function(err, user) {
					test_auth_user = user;
					return done();
				});
		});

		it('should require an existing user', function(done) {
			this.request.post('/api/v1/auth/login')
				.send({ email: 'idonot@exist.com', password: 'test' })
				.expect(401, done);
		});

		it('should require a correct password', function(done) {
			this.request.post('/api/v1/auth/login')
				.send({ email: 'auth@auth.auth', password: 'test1234' })
				.expect(401, done);
		});

		it.skip('should require email and password');
		it.skip('should return a token');
	});

	describe('POST /auth/logout', function() {
		it.skip('should require a token');
		it.skip('should invalidate the token');
	});

	describe('POST /auth/register', function() {
		it.skip('should require email and password');
		it.skip('should send a confirmation email');
		it.skip('should not login until confirmation');
		it.skip('should login after confirmation');
	});
});
