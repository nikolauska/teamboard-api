'use strict';

var mockery   = require('mockery');
var mongoose  = require('mongoose');
var mockgoose = require('mockgoose');
var supertest = require('supertest');

// Read the app's configuration file.
var config = require('../config');

// Set the 'NODE_ENV' for this process as 'test'. This will disable
// 'development' level logging, making test output more readable.
process.env.NODE_ENV = 'test';

// Make sure to mock any mongoose stuff, so no DB is required.
mockgoose(mongoose);

// Mock our 'emitter' module, which creates a Redis connection...
var emitter = {
	to: function(room) {
		return this;
	},
	emit: function(event, data) {
		return this;
	}
}

// Note that when we 'mock' the emitter module, we actually
mockery.registerMock('./emitter', emitter);

// Make sure mockery doesn't spam the console with warnings about various
// modules that are not mocked. It also needs to be explicitly enabled.
mockery.enable({ warnOnUnregistered: false });

before(function(done) {
	this.app = supertest(require('../server').app);
	mongoose.connect(config.mongo.url, config.mongo.options, done);
});

describe('Application', function() {
	// We create a 'context', in which we can transport data between the test
	// cases. In a sense this is not idiomatic for unit testing, but w/e.
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

	// describe('Commenting on a ticket',
	// 	require('./spec/posting-a-comment')(context));

	describe('Granting guest access',
		require('./spec/granting-guest-access')(context));

	// describe('Fetching board events',
	// 	require('./spec/fetching-events')(context));

	describe('Using guest token',
		require('./spec/using-guest-token')(context));

	describe('Revoking guest access',
		require('./spec/revoking-guest-access')(context));

	describe('Exporting to a file',
		require('./spec/exporting-to-a-file')(context));
});
