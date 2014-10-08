'use strict';

var mongoose = require('mongoose');

var TicketSchema = module.exports = new mongoose.Schema({
	heading: {
		type:     String,
		required: true
	},
	content: {
		type: String
	},
	position: {
		x: {
			type:    Number,
			default: 0
		},
		y: {
			type:    Number,
			default: 0
		},
		z: {
			type:    Number,
			default: 0
		}
	},
	color: {
		type: String
	}
	// owner: {
	// 	ref:      'user',
	// 	type:     mongoose.Schema.Types.ObjectId,
	// 	required: true
	// },
	// members: [{
	// 	ref:  'user',
	// 	type: mongoose.Schema.Types.ObjectId
	// }]
});

if(!TicketSchema.options.toJSON) TicketSchema.options.toJSON     = { }
if(!TicketSchema.options.toObject) TicketSchema.options.toObject = { }

TicketSchema.options.toJSON.transform = function(doc, ret) {
	ret.id = doc.id;

	delete ret._id;
	delete ret.__v;
}

TicketSchema.options.toObject.transform = TicketSchema.options.toJSON.transform;
