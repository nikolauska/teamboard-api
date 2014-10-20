'use strict';

/**
 * Describes updating a Ticket.
 */
module.exports = function(ctx) {
	return function() {

		var endpoint    = null;
		var credentials = null;

		before(function() {
			credentials = {
				'access_token': ctx.credentials.token
			}
			endpoint = '/boards/' + ctx.board.id + '/tickets/' + ctx.ticket.id;
		});

		it('should require authentication', function(done) {
			this.app.put(endpoint).expect(401, done);
		});

		var dummyid       = require('mongoose').Types.ObjectId();
		var dummyendpoint = '/boards/' + dummyid + '/tickets/' + dummyid;

		it('should require existing board and ticket', function(done) {
			this.app.put(dummyendpoint).send(credentials).expect(404, done);
		});

		// TODO Create a dummy user.
		it.skip('should require access to board');

		var payload = {
			'color':    '#FAFAFA',
			'content':  'new-content',
			'position': { 'x': 0, 'y': 8, 'z': 0 }
		}

		it('should return the updated ticket', function(done) {
			this.app.put(endpoint).send(credentials).send(payload)
				.expect(200, function(err, res) {
					if(err) {
						return done(err);
					}

					var ticket = res.body;

					ticket.should.be.an.Object;
					ticket.should.have.properties([
						'heading', 'content', 'color', 'position'
					]);

					ticket.heading.should.equal(ctx.ticket.heading);
					ticket.content.should.equal(payload.content);

					ticket.color.should.equal(payload.color);

					ticket.position.should.be.an.Object;
					ticket.position.should.have.properties([ 'x', 'y', 'z' ]);

					ticket.position.x.should.equal(payload.position.x);
					ticket.position.y.should.equal(payload.position.y);
					ticket.position.z.should.equal(payload.position.z);

					ctx.ticket = ticket;

					return done();
				});
		});
	}
}
