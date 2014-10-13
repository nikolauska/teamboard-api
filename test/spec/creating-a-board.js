'use strict';

/**
 * Describes creating a Board.
 */
module.exports = function(ctx) {
	return function() {

		it('should require authentication', function(done) {
			this.app.post('/boards').expect(401, done);
		});

		it('should require a \'name\'', function(done) {
			this.app.post('/boards')
				.send({ 'access_token': ctx.credentials.token })
				.expect(400, done);
		});

		it('should initialize the board to valid defaults', function(done) {
			var self = this;

			this.app.post('/boards')
				.send({ 'access_token': ctx.credentials.token })
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
					board.createdBy.id.should.equal(ctx.user.id);

					ctx.board = board;


					return done();
				});
		});
	}
}
