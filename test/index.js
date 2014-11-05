'use strict';

var chalk     = require('chalk');
var purdy     = require('purdy');
var mongoose  = require('mongoose');
var mockgoose = require('mockgoose');
var supertest = require('supertest');

// Set the 'NODE_ENV' for this process as 'test'. This will disable
// 'development' level logging, making test output more readable.
process.env.NODE_ENV = 'test';

var config = require('../config');

// Wrap Mongoose with Mockgoose
mockgoose(mongoose);

/**
 * Setup 'supertest'. Declare 'demousers'. Establish mongoose connection.
 */
before(function(done) {
	console.log(chalk.dim('Initializing...'));

	var server = require('../server');
	this.app   = supertest(server.app);

	console.log(chalk.dim('Using MongDB configuration:\n'));
	purdy(config.mongo);

	mongoose.connect(config.mongo.url, config.mongo.options, done);
});

// Throw in a newline for clarity.
before(console.log.bind(console, ''));

/**
 * A basic 'user' workflow.
 */
describe('Basic API usage', function() {

	var context = { }

	describe('Signing up',
		require('./spec/signing-up')(context));

	describe('Logging in',
		require('./spec/signing-in')(context));

	describe('Creating a board',
		require('./spec/creating-a-board')(context));

	describe('Updating a board',
		require('./spec/updating-a-board')(context));

	describe('Creating a ticket',
		require('./spec/creating-a-ticket')(context));

	describe('Updating a ticket',
		require('./spec/updating-a-ticket')(context));

	describe('Commenting on a ticket',
		require('./spec/posting-a-comment')(context));

	describe('Granting guest access',
		require('./spec/granting-guest-access')(context));

	describe('Fetching board events',
		require('./spec/fetching-events')(context));

	describe('Using guest token',
		require('./spec/using-guest-token')(context));

	describe('Revoking guest access',
		require('./spec/revoking-guest-access')(context));
});
