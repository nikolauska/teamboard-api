'use strict';

var chalk     = require('chalk');
var purdy     = require('purdy');
var mongoose  = require('mongoose');
var supertest = require('supertest');

// Set the 'NODE_ENV' for this process as 'test'. This will disable
// 'development' level logging, making test output more readable.
process.env.NODE_ENV = 'test';

var config = require('../config');

/**
 * Setup 'supertest'. Declare 'demousers'. Establish mongoose connection.
 */
before(function(done) {
	console.log(chalk.dim('\nInitializing...'));

	var server = require('../server');
	this.app   = supertest(server.app);

	this.user = {
		'email':    'kari@taalas.maa',
		'password': 'talon-mies-poika-isanmaa'
	}

	console.log(chalk.dim('\nUsing MongDB configuration:'));
	purdy(config.mongo);
	console.log('\n');

	mongoose.connect(config.mongo.url, config.mongo.options, done);
});

/**
 * Drop necessary collections from mongodb.
 */
[ 'user', 'board', 'ticket' ].forEach(function(collection) {

	before(function(done) {
		console.log(chalk.dim('Dropping collection...'),
			chalk.red(collection));

		var Model = mongoose.model(collection);
		Model.collection.count(function(err, count) {
			if(err) {
				return done(err);
			}

			if(count > 0) {
				return Model.collection.drop(done);
			}

			return done();
		});
	});
});

/**
 * Create a 'testuser'.
 */
before(function(done) {
	var self = this;
	var User = mongoose.model('user');

	new User(self.user).save(function(err, user) {
		if(err) {
			return done(err);
		}
		self.user.id = user.id;

		console.log(chalk.dim('\nTestuser created:'));
		purdy(self.user);

		console.log(chalk.dim('\nStarting tests...\n'));
		return done();
	});
});

/**
 *
 */
describe('Basic user actions', function() {
	describe('Signing up',        require('./spec/signing-up'));
	describe('Logging in',        require('./spec/signing-in'));
	describe('Creating a board',  require('./spec/creating-a-board'));
	describe('Creating a ticket', require('./spec/creating-a-ticket'));
});