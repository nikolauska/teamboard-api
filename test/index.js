'use strict';


var config   = require('../config');
var mongoose = require('mongoose');

/**
 * Setup 'supertest'. Declare 'demousers'. Establish mongoose connection.
 */
before(function(done) {
	console.log('setting up...');

	this.request = require('supertest')(require('../server').app);

	this.kari  = { email: 'kari@taalas.maa',  password: 'poika' }
	this.seppo = { email: 'seppo@taalas.maa', password: 'talkkari' }

	console.log('connecting to mongoose, using:', JSON.stringify(config.mongo));
	mongoose.connect(config.mongo.host, config.mongo.options, done);
});

/**
 * Drop necessary collections from mongodb.
 */
['user', 'board'].forEach(function(model) {
	before(function(done) {
		console.log('dropping collection', model);
		var Model = mongoose.model(model);
		Model.collection.count(function(err, count) {
			if(err) {
				return done(err);
			}
			if(count > 0) {
				return Model.collection.drop(done);
			}
			console.log('Nothing to drop!');
			return done();
		});
	});
});

/**
 * Add 'kari' user.
 */
before(function(done) {

	var self = this;
	var User = mongoose.model('user');

	new User(self.kari).save(function(err, user) {
		if(err) {
			return done(err);
		}
		self.kari.id = user.id;
		return done();
	});
});

/**
 * Add 'seppo' user.
 */
before(function(done) {

	var self = this;
	var User = mongoose.model('user');

	new User(self.seppo).save(function(err, user) {
		if(err) {
			return done(err);
		}
		self.seppo.id = user.id;
		return done();
	});
});

/**
 * Login 'kari' user.
 */
before(function(done) {

	var self = this;
	self.request.post('/api/v1/auth/login')
		.send(self.kari)
		.expect(200, function(err, res) {

			if(err) {
				return done(err);
			}

			self.kari.access_token = res.headers['x-access-token'];

			return done();
		});
});

/**
 * Login 'seppo' user.
 */
before(function(done) {

	var self = this;
	self.request.post('/api/v1/auth/login')
		.send(self.seppo)
		.expect(200, function(err, res) {

			if(err) {
				return done(err);
			}

			self.seppo.access_token = res.headers['x-access-token'];

			return done();
		});
});
