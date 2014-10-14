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

	console.log(chalk.dim('\nUsing MongDB configuration:\n'));
	purdy(config.mongo);

	mongoose.connect(config.mongo.url, config.mongo.options, done);
});

/**
 * Drop necessary collections from mongodb.
 */
before(function() {
	console.log(chalk.dim('\nDropping the database...\n'));
	mongoose.connection.db.dropDatabase();
});

/**
 * Ensure indexes for each collection
 */
[ 'user', 'board', 'ticket' ].forEach(function(name) {
	before(function(done) {
		console.log(chalk.dim('Ensuring indexes for...', chalk.yellow(name)));
		mongoose.model(name).ensureIndexes(done);
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