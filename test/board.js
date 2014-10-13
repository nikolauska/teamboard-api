'use strict';

/**
 * Basic API Usage.
 */
describe('/boards', function() {

	var accessToken = null;

	/**
	 * Login with our testuser to generate an 'access-token'.
	 */
	before(function(done) {
		this.app.post('/auth/login')
			.send(this.user)
			.expect(200, function(err, res) {
				if(err) {
					return done(err);
				}

				accessToken = res.headers['x-access-token'];

				return done();
			});
	});

	// 1.  Creating a Board
	//     - check valid defaults etc...
	// 2.  Updating a Board
	//     - validation ...
	// 3.  Creating a Ticket
	// 4.  Updating a Ticket (moving, editing)
	// 5.  Updating a Board (again)
	// 6.  Removing a Ticket
	// 7.  Accessing a removed ticket
	// 8.  Removing a Board
	// 9.  Accessing a removed board
	//
	// describe('Basic API Usage',
	//   describe('Creating a Board',
	//     it('should require authentication')
	//     it('should require only a name')))
	//   describe('Updating a Board')
	//     ...


	describe('/boards', function() {

		describe('POST', function() {

			it('should initialize to some defaults', function(done) {
				var self = this;

				// We send only the minimum amount of information to the server
				// and check what the server defaults the rest of fields to.
				this.app.post('/boards')
					.send({ 'name': 'plankku' })
					.send({ 'access_token': accessToken })
					.expect(201, function(err, res) {
						if(err) {
							return done(err);
						}

						var board = res.body;

						// The server should only set attributes sent, so
						// 'description' should not be undefined.
						board.name.should.equal('plankku');
						board.description.should.equal('');

						// Size is the board's size in 'tickets'.
						//
						// TODO Default values are hardcoded here, they should
						//      be read from configuration.
						board.size.should.be.an.Object;
						board.size.width.should.equal(8);
						board.size.height.should.equal(8);

						// Background should default to 'none'.
						//
						// TODO Background should be an enumeration.
						board.background.should.equal('none');

						// Check that the 'createdBy' field gets populated by
						// the server and that the 'id' gets set to the
						// requesting user's 'id'.
						board.createdBy.should.be.an.Object;
						board.createdBy.id.should.be.a.String;
						board.createdBy.id.should.equal(self.user.id);

						return done();
					});
			});

			// TODO Handle the validation cases etc.
		});
	});

	describe('/boards/:id/access', function() {

		/**
		 * Create a 'board' on which 'access_code' will be generated.
		 */
		before(function(done) {

		});

		describe('GET', function() {
			it.skip('should return an empty \'access-code\'');
		});
	});
});


// describe('routes/board', function() {

// 	var testBoard = null;
// 	var createdViaAPI = null;

// 	before(function(done) {

// 		var Board = require('mongoose').model('board');

// 		new Board({ name: 'a', info: 'b', owner: this.seppo.id })
// 			.save(function(err, board) {

// 				if(err) {
// 					return done(err);
// 				}

// 				testBoard = board;

// 				return done();
// 			});
// 	});

// 	describe('GET /boards', function() {

// 		it.skip('should require authentication', function(done) {
// 			this.request.get('/api/v1/boards')
// 				.expect(401, done);
// 		});

// 		it('should return an array of boards', function(done) {
// 			this.request.get('/api/v1/boards')
// 				.send({ access_token: this.seppo.access_token })
// 				.expect(200, function(err, res) {

// 					if(err) {
// 						return done(err);
// 					}

// 					res.body.should.be.an.Array;
// 					res.body.length.should.equal(1);

// 					return done();
// 				});
// 		});

// 		it('should return only boards user is part of', function(done) {
// 			this.request.get('/api/v1/boards')
// 				.send({ access_token: this.kari.access_token })
// 				.expect(200, function(err, res) {

// 					if(err) {
// 						return done(err);
// 					}

// 					res.body.should.be.an.Array;
// 					res.body.length.should.equal(0);

// 					return done();
// 				});
// 		});
// 	});

// 	describe('POST /boards', function() {

// 		it('should require authentication', function(done) {
// 			this.request.post('/api/v1/boards')
// 				.expect(401, done);
// 		});

// 		it('should require \'name\' attribute', function(done) {
// 			this.request.post('/api/v1/boards')
// 				.send({ access_token: this.seppo.access_token })
// 				.send({ info: 'ei' })
// 				.expect(400, done);
// 		});

// 		it('should set user as the owner', function(done) {

// 			var self = this;
// 			this.request.post('/api/v1/boards')
// 				.send({ access_token: this.seppo.access_token })
// 				.send({ name: 'nyt', info: 'toimii' })
// 				.expect(201, function(err, res) {

// 					if(err) {
// 						return done(err);
// 					}

// 					res.body.should.be.an.Object;
// 					res.body.should.have.property('owner');
// 					res.body.owner.should.be.an.Object;
// 					res.body.owner.id.should.equal(self.seppo.id);

// 					createdViaAPI = res.body;

// 					return done();
// 				});
// 		});
// 	});

// 	describe('DELETE /boards?boards=123,124,125...', function() {
// 		var boardsToDelete = [ ]
// 		var cantDelete     = [ ]

// 		before(function(done) {
// 			var Board = require('mongoose').model('board');
// 			new Board({ name: 'delete', info: 'me', owner: this.kari.id })
// 				.save(function(err, board) {
// 					if(err) {
// 						return done(err);
// 					}
// 					boardsToDelete.push(board.id);
// 					return done();
// 				});
// 		});

// 		before(function(done) {
// 			var Board = require('mongoose').model('board');
// 			new Board({ name: 'delete2', info: 'me2', owner: this.kari.id })
// 				.save(function(err, board) {
// 					if(err) {
// 						return done(err);
// 					}
// 					boardsToDelete.push(board.id);
// 					return done();
// 				});
// 		});

// 		before(function(done) {
// 			var Board = require('mongoose').model('board');
// 			new Board({ name: 'cant', info: 'deleteme', owner: this.seppo.id })
// 				.save(function(err, board) {
// 					if(err) {
// 						return done(err);
// 					}
// 					cantDelete.push(board.id);
// 					return done();
// 				});
// 		});

// 		it('should require authentication', function(done) {
// 			this.request.delete(
// 					'/api/v1/boards?boards=' + boardsToDelete.join(',') + '')
// 				.expect(401, done);
// 		});

// 		it('should allow owner to delete boards', function(done) {
// 			this.request.delete(
// 					'/api/v1/boards?boards=' + boardsToDelete.join(',') + '')
// 				.send({ access_token: this.kari.access_token })
// 				.expect(200, function(err, res) {
// 					if(err) {
// 						return done(err);
// 					}
// 					res.body.should.be.an.Array;
// 					res.body.length.should.equal(boardsToDelete.length);
// 					return done();
// 				});
// 		});

// 		it('should not allow deletion of non-owned boards', function(done) {
// 			this.request.delete(
// 					'/api/v1/boards?boards=' + cantDelete.join(',') + '')
// 				.send({ access_token: this.kari.access_token })
// 				.expect(403, done);
// 		});
// 	});

// 	describe('GET /boards/:board_id', function() {

// 		it.skip('should require authentication', function(done) {
// 			this.request.get('/api/v1/boards/123')
// 				.expect(401, done);
// 		});

// 		it('should return a single board', function(done) {
// 			this.request.get('/api/v1/boards/' + testBoard.id)
// 				.send({ access_token: this.seppo.access_token })
// 				.expect(200, function(err, res) {

// 					if(err) {
// 						return done(err);
// 					}

// 					res.body.should.be.an.Object;
// 					res.body.should.have.properties([
// 						'id', 'name', 'info', 'owner', 'members'
// 					]);

// 					return done();
// 				});
// 		});

// 		it('should return only boards user is part of', function(done) {
// 			this.request.get('/api/v1/boards/' + testBoard.id)
// 				.send({ access_token: this.kari.access_token })
// 				.expect(403, done);
// 		});
// 	});

// 	describe('PUT /boards/:board_id', function() {

// 		it('should require authentication', function(done) {
// 			this.request.put('/api/v1/boards/' + testBoard.id)
// 				.expect(401, done);
// 		});

// 		it('should require user to be the owner', function(done) {
// 			this.request.put('/api/v1/boards/' + testBoard.id)
// 				.send({ access_token: this.kari.access_token })
// 				.expect(403, done);
// 		});

// 		it('should accept an update', function(done) {
// 			this.request.put('/api/v1/boards/' + testBoard.id)
// 				.send({ access_token: this.seppo.access_token })
// 				.send({ name: 'updated', info: 'board' })
// 				.expect(200, done);
// 		});

// 		it('should accept a partial update', function(done) {
// 			this.request.put('/api/v1/boards/' + testBoard.id)
// 				.send({ access_token: this.seppo.access_token })
// 				.send({ name: 'another update' })
// 				.expect(200, done);
// 		});

// 		it.skip('should return the updated board');
// 	});

// 	describe('DELETE /boards/:board_id', function() {

// 		var deleteBoard = null;

// 		before(function(done) {

// 			var Board = require('mongoose').model('board');

// 			new Board({ name: 'b', info: 'c', owner: this.kari.id })
// 				.save(function(err, board) {

// 					if(err) {
// 						return done(err);
// 					}

// 					deleteBoard = board;

// 					return done();
// 				});
// 		});

// 		it('should require authentication', function(done) {
// 			this.request.delete('/api/v1/boards/' + deleteBoard.id)
// 				.expect(401, done);
// 		});

// 		it('should require user to be the owner', function(done) {
// 			this.request.delete('/api/v1/boards/' + deleteBoard.id)
// 				.send({ access_token: this.seppo.access_token })
// 				.expect(403, done);
// 		});

// 		it('should return persist the changes', function(done) {
// 			this.request.delete('/api/v1/boards/' + deleteBoard.id)
// 				.send({ access_token: this.kari.access_token })
// 				.expect(200, function(err, res) {

// 					if(err) {
// 						return done(err);
// 					}

// 					res.body.should.be.an.Object;
// 					res.body.should.have.properties(['id', 'name', 'info']);

// 					// should have owner and members ...

// 					return done();
// 				});
// 		});
// 	});

// 	describe('GET /boards/:board_id/users', function() {

// 		it.skip('should require authentication', function(done) {
// 			this.request.get('/api/v1/boards/' + testBoard.id + '/users')
// 				.expect(401, done);
// 		});

// 		it('should require user to be part of the board', function(done) {
// 			this.request.get('/api/v1/boards/' + testBoard.id + '/users')
// 				.send({ access_token: this.kari.access_token })
// 				.expect(403, done);
// 		});

// 		it('should return an object containing owner and members',
// 			function(done) {
// 				this.request.get('/api/v1/boards/' + createdViaAPI.id + '/users')
// 					.send({ access_token: this.seppo.access_token })
// 					.expect(200, function(err, res) {

// 						if(err) {
// 							return done(err);
// 						}

// 						res.body.should.be.an.Object;
// 						res.body.should.have.properties(['owner', 'members']);

// 						res.body.owner.should.be.an.Object;
// 						res.body.members.should.be.an.Array;

// 						return done();
// 					});
// 			});
// 	});

// 	describe('POST /boards/:board_id/users', function() {

// 		var postUsersUser  = null;
// 		var postUsersBoard = null;

// 		before(function(done) {

// 			var Board = require('mongoose').model('board');

// 			new Board({
// 					name: 'b',
// 					info: 'c',
// 					owner: this.seppo.id,
// 					members: [ this.kari.id ]
// 				})
// 				.save(function(err, board) {

// 					if(err) {
// 						return done(err);
// 					}

// 					postUsersBoard = board;

// 					return done();
// 				});
// 		});

// 		before(function(done) {

// 			var User = require('mongoose').model('user');

// 			new User({
// 					email:    'ulla@taalas.maa',
// 					password: 'talkkari'
// 				})
// 				.save(function(err, user) {

// 					if(err) {
// 						return done(err);
// 					}

// 					postUsersUser = user;

// 					return done();
// 				});
// 		});

// 		it('should require authentication', function(done) {
// 			this.request.post('/api/v1/boards/' + postUsersBoard.id + '/users')
// 				.expect(401, done);
// 		});

// 		it('should require user to be the owner', function(done) {
// 			this.request.post('/api/v1/boards/' + postUsersBoard.id + '/users')
// 				.send({ access_token: this.kari.access_token })
// 				.expect(403, done);
// 		});

// 		it('should not accept the owner', function(done) {
// 			this.request.post('/api/v1/boards/' + postUsersBoard.id + '/users')
// 				.send({ access_token: this.seppo.access_token })
// 				.send({ id: this.seppo.id })
// 				.expect(409, done);
// 		});

// 		it('should not accept existing members', function(done) {
// 			this.request.post('/api/v1/boards/' + postUsersBoard.id + '/users')
// 				.send({ access_token: this.seppo.access_token })
// 				.send({ id: this.kari.id })
// 				.expect(409, done);
// 		});

// 		it('should return the added user', function(done) {
// 			this.request.post('/api/v1/boards/' + postUsersBoard.id + '/users')
// 				.send({ access_token: this.seppo.access_token })
// 				.send({ id: postUsersUser.id })
// 				.expect(200, function(err, res) {

// 					if(err) {
// 						return done(err);
// 					}

// 					res.body.should.be.an.Object;
// 					res.body.should.have.properties(['id', 'email']);

// 					return done();
// 				});
// 		});
// 	});

// 	describe('GET /boards/:board_id/users/:user_id', function() {

// 		it.skip('should require authentication', function(done) {

// 			var bid = testBoard.id;
// 			var uid = this.seppo.id;

// 			this.request.get('/api/v1/boards/' + bid + '/users/' + uid)
// 				.expect(401, done);
// 		});

// 		it('should require user to have access to board', function(done) {

// 			var bid = testBoard.id;
// 			var uid = this.seppo.id;

// 			this.request.get('/api/v1/boards/' + bid + '/users/' + uid)
// 				.send({ access_token: this.kari.access_token })
// 				.expect(403, done);
// 		});

// 		it('should require requested user to be a member or owner',
// 			function(done) {

// 				var bid = testBoard.id;
// 				var uid = this.kari.id;

// 				this.request.get('/api/v1/boards/' + bid + '/users/' + uid)
// 					.send({ access_token: this.seppo.access_token })
// 					.expect(400, done);
// 			});

// 		it('should return a single user', function(done) {

// 			var bid = testBoard.id;
// 			var uid = this.seppo.id;

// 			this.request.get('/api/v1/boards/' + bid + '/users/' + uid)
// 				.send({ access_token: this.seppo.access_token })
// 				.expect(200, function(err, res) {

// 					if(err) {
// 						return done(err);
// 					}

// 					res.body.should.be.an.Object;
// 					res.body.should.have.properties(['id', 'email']);

// 					return done();
// 				});
// 		});
// 	});

// 	describe('DELETE /boards/:board_id/users/:user_id', function() {

// 		var deleteUsersBoard = null;

// 		before(function(done) {

// 			var Board = require('mongoose').model('board');

// 			new Board({
// 					name: 'deleteUsersBoard',
// 					info: 'information',
// 					owner: this.seppo.id,
// 					members: [ this.kari.id ]
// 				})
// 				.save(function(err, board) {

// 					if(err) {
// 						return done(err);
// 					}

// 					deleteUsersBoard = board;

// 					return done();
// 				});
// 		});

// 		it('should require authentication', function(done) {

// 			var bid = deleteUsersBoard.id;
// 			var uid = this.kari.id;

// 			this.request.delete('/api/v1/boards/' + bid + '/users/' + uid)
// 				.expect(401, done);
// 		});

// 		it.skip('should require user to be owner of the board', function(done) {

// 			var bid = deleteUsersBoard.id;
// 			var uid = this.kari.id;

// 			this.request.delete('/api/v1/boards/' + bid + '/users/' + uid)
// 				.send({ access_token: this.kari.access_token })
// 				.expect(403, done);
// 		});

// 		it.skip('should return the removed member', function(done) {

// 			var bid = deleteUsersBoard.id;
// 			var uid = this.kari.id;

// 			this.request.delete('/api/v1/boards/' + bid + '/users/' + uid)
// 				.send({ access_token: this.seppo.access_token })
// 				.expect(200, function(err, res) {

// 					if(err) {
// 						return done(err);
// 					}

// 					res.body.should.be.an.Object;
// 					res.body.should.have.properties(['id', 'email']);

// 					// should equal kari

// 					return done();
// 				});
// 		});
// 	});

// 	describe('GET /boards/:board_id/tickets', function() {

// 		before(function(done) {

// 			var self  = this;
// 			var Board = require('mongoose').model('board');

// 			Board.find({ _id: testBoard.id }, function(err, boards) {

// 				if(err) {
// 					return done(err);
// 				}

// 				var board  = boards[0];
// 				var ticket = board.tickets.create({
// 					owner:   self.seppo.id,
// 					heading: 'asd',
// 					content: 'asd'
// 				});

// 				board.tickets.push(ticket);
// 				board.save(done);
// 			});
// 		});


// 		it.skip('should require authentication', function(done) {
// 			this.request.get('/api/v1/boards/' + testBoard.id + '/tickets')
// 				.expect(401, done);
// 		});

// 		it('should return an array of tickets', function(done) {
// 			this.request.get('/api/v1/boards/' + testBoard.id + '/tickets')
// 				.send({ access_token: this.seppo.access_token })
// 				.expect(200, function(err, res) {

// 					if(err) {
// 						return done(err);
// 					}

// 					res.body.should.be.an.Array;
// 					res.body.length.should.equal(1);

// 					return done();
// 				});
// 		});
// 	});

// 	describe('POST /boards/:board_id/tickets', function() {

// 		it('should require authentication', function(done) {
// 			this.request.post('/api/v1/boards/' + testBoard.id + '/tickets')
// 				.expect(401, done);
// 		});

// 		it.skip('should require access to the board');

// 		it.skip('should require a heading');
// 		it.skip('should not require content or position');

// 		it.skip('should return the created ticket');
// 		it.skip('should set owner as the person making the request');
// 	});

// 	describe('GET /boards/:board_id/tickets/:ticket_id', function() {
// 		it.skip('should require authentication');
// 		it.skip('should require access to the board');
// 		it.skip('should return a single ticket');
// 		it.skip('should have full data about owner and members');
// 	});

// 	describe('PUT /boards/:board_id/tickets/:ticket_id', function() {
// 		it.skip('should require authentication');
// 		it.skip('should require access to the board');
// 		it.skip('should not return any content');
// 		it.skip('should accept partial updates');
// 	});

// 	describe('DELETE /boards/:board_id/tickets/:ticket_id', function() {
// 		it.skip('should require authentication');
// 		it.skip('should require access to the board');
// 		it.skip('should return the deleted ticket');
// 	});
// });
