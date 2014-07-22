'use strict';


var crypto   = require('crypto');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var GuestSchema = new mongoose.Schema({

	email: { type: String, match: /\S+@\S+\.\S+/, required: true },

	secret: { type: String, required: true }
});

GuestSchema.pre('save', function(next) {
	this.secret = crypto.createHash('sha1')
		.update(crypto.randomBytes(16))
		.toString('hex');
	return next();
});

GuestSchema.pre('save', function(next) {
	mongoose.model('user').count({ email: this.email }, function(err, count) {
		if(err) {
			return next(err);
		}
		if(count > 0) {
			return next(new Error('Duplicate Email'));
		}
		return next();
	});
});

GuestSchema.pre('save', function(next) {
	this.wasNew = this.isNew;
	return done();
});

GuestSchema.post('save', function() {
	if(this.wasNew) {
		// send email...with secret link...
	}
});

if(!GuestSchema.options.toJSON)   GuestSchema.options.toJSON   = { }
if(!GuestSchema.options.toObject) GuestSchema.options.toObject = { }

GuestSchema.options.toJSON.transform = function(doc, ret) {

	ret.id = doc.id;

	delete ret._id;
	delete ret.__v;

	delete ret.secret;
}

GuestSchema.options.toObject.transform = GuestSchema.options.toJSON.transform;


module.exports = GuestSchema;
