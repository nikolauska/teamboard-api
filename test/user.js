'use strict';


describe('routes/user', function() {

	describe('GET /users', function() {

		it('should require authentication', function(done) {
			this.request.get('/api/v1/users')
				.expect(401, done);
		});

		it('should return all users', function(done) {
			this.request.get('/api/v1/users')
				.send({ access_token: this.seppo.access_token })
				.expect(200, function(err, res) {

					if(err) {
						return done(err);
					}

					res.body.should.be.an.Array;

					return done();
				});
		});

		it('should not contain any sensitive information', function(done) {
			this.request.get('/api/v1/users')
				.send({ access_token: this.seppo.access_token })
				.expect(200, function(err, res) {

					if(err) {
						return done(err);
					}

					res.body.should.be.an.Array;

					for(var i = 0; i < res.body.length; i++) {
						res.body[i].should.have.properties(['id', 'email']);
						res.body[i].should.not.have.properties([
							'password', 'token']);
					}

					return done();
				});
		});
	});

	describe('GET /users/:user_id', function() {

		it('should require authentication', function(done) {
			this.request.get('/api/v1/users/123')
				.expect(401, done);
		});

		it('should return a single user', function(done) {

			var self = this;
			self.request.get('/api/v1/users/' + self.seppo.id)
				.send({ access_token: self.seppo.access_token })
				.expect(200, function(err, res) {

					if(err) {
						return done(err);
					}

					var user = res.body;

					user.should.be.an.Object;
					user.id.should.equal(self.seppo.id);
					user.email.should.equal(self.seppo.email);

					return done();
				});
		});

		it('should not contain any sensitive information', function(done) {
			this.request.get('/api/v1/users/' + this.seppo.id)
				.send({ access_token: this.seppo.access_token })
				.expect(200, function(err, res) {

					if(err) {
						return done(err);
					}

					res.body.should.be.an.Object;
					res.body.should.have.properties(['id', 'email']);
					res.body.should.not.have.properties(['password', 'token']);

					return done();
				});
		});
	});
});

