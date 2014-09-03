'use strict';

var _        = require('lodash');
var mongoose = require('mongoose');

var BoardSchema = module.exports = new mongoose.Schema({
	name: {
		type:     String,
		required: true
	},
	info: {
		type: String
	},
	size: {
		width: {
			type: Number,
			default: 8
		},
		height: {
			type: Number,
			default: 8
		}
	},
	background: {
		type:    String,
		default: "none"
	},
	isPublic: {
		type:    Boolean,
		default: false
	},
	owner: {
		ref:      'user',
		type:     mongoose.Schema.Types.ObjectId,
		required: true
	},
	members: [{
		ref: 'user',
		type: mongoose.Schema.Types.ObjectId
	}],
	tickets: [
		require('./ticket')
	]
});

if(!BoardSchema.options.toJSON) BoardSchema.options.toJSON     = { }
if(!BoardSchema.options.toObject) BoardSchema.options.toObject = { }

BoardSchema.options.toJSON.transform = function(doc, ret) {
	ret.id = doc.id;

	delete ret._id;
	delete ret.__v;
}

BoardSchema.options.toObject.transform = BoardSchema.options.toJSON.transform;

BoardSchema.methods.isOwner = function(user) {
	var owner = this.populated('owner') || this.owner;
	return owner == user.id;
}

BoardSchema.methods.isMember = function(user) {
	var members = this.populated('members') || this.members;
	var isMember = _.find(members, function(member) {
		return member == user.id;
	});
	return isMember != undefined && isMember != null;
}
