'use strict';

/**
 * Describes creating a Ticket.
 */
module.exports = function(ctx) {
	return function() {

		it('should require authentication', function(done) {
			this.app.post('/boards/' + ctx.board.id + '/tickets')
				.expect(401, done);
		});

		it('should require an existing board', function(done) {
			var id = require('mongoose').Types.ObjectId();

			this.app.post('/boards/' + id + '/tickets')
				.send({ 'access_token': ctx.credentials.token })
					.expect(404, done);
		});

		// TODO Create a dummy user.
		it.skip('should require access to board');

		it('should initialize the ticket to valid defaults', function(done) {
			this.app.post('/boards/' + ctx.board.id + '/tickets')
				.send({ 'access_token': ctx.credentials.token })
				.send({ 'heading': 'bababa ba ba baba baa baba yee'})
				.expect(201, function(err, res) {
					if(err) {
						return done(err);
					}

					var ticket = res.body;

					ticket.should.have.properties([
						'heading', 'content', 'color', 'position'
					]);

					ticket.heading.should.be.a.String;
					ticket.content.should.be.a.String;

					// TODO Validate the color somehow. Are the colors defined
					//      somewhere, or do we only accept a specific format
					//      such as 'hex' / #BABABA
					ticket.color.should.be.a.String;

					ticket.position.should.be.an.Object;
					ticket.position.should.have.properties(['x', 'y', 'z']);

					ticket.position.x.should.be.a.Number;
					ticket.position.y.should.be.a.Number;
					ticket.position.z.should.be.a.Number;

					ctx.ticket = ticket;

					return done();
				});
		});
	}
}
