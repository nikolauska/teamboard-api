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

// Throw in a newline for clarity.
before(console.log.bind(console, ''));

/**
 * A basic 'user' workflow.
 */
describe('Basic API usage', function() {

	var context = { }

	describe('Signing up',        require('./spec/signing-up')(context));
	describe('Logging in',        require('./spec/signing-in')(context));
	describe('Creating a board',  require('./spec/creating-a-board')(context));
	describe('Creating a ticket', require('./spec/creating-a-ticket')(context));
});