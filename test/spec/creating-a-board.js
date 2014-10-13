'use strict';

/**
 * Describes creating a Board.
 */
module.exports = function() {

	var credentials = {
		'email':     'saasta@moi.nen',
		'password':  'saastamoinen'
	}


	before(function register(done) {
		this.app.post('/auth/register')
			.send(credentials).expect(201, done);
	});

	before(function login(done) {
		this.app.post('/auth/login')
			.send(credentials).expect(200, function(err, res) {
				if(err) {
					return done(err);
				}

				credentials.token = res.headers['x-access-token'];

				return done();
			});
	});

	it('should require authentication', function(done) {
		this.app.post('/boards').expect(401, done);
	});

	it('should require a \'name\'', function(done) {
		this.app.post('/boards')
			.send({ 'access_token': credentials.token })
			.expect(400, done);
	});

	it('should initialize the board to valid defaults', function(done) {
		this.app.post('/boards')
			.send({ 'access_token': credentials.token })
			.send({ 'name': 'plankku' })
			.expect(201, function(err, res) {
				if(err) {
					return done(err);
				}

				var board = res.body;

				// The server should only set attributes sent, so 'description'
				// should not be undefined.
				board.name.should.equal('plankku');
				board.description.should.equal('');

				// Size is the board's size in 'tickets'.
				//
				// TODO Default values are hardcoded here, they should be read
				//      from configuration.
				board.size.should.be.an.Object;
				board.size.width.should.equal(8);
				board.size.height.should.equal(8);

				// Background should default to 'none'.
				//
				// TODO Background should be an enumeration.
				board.background.should.equal('none');

				// Check that the 'createdBy' field gets populated by the server
				// and that the 'id' gets set to the requesting user's 'id'.
				board.createdBy.should.be.an.Object;
				board.createdBy.id.should.be.a.String;

				return done();
			});
	});
}
