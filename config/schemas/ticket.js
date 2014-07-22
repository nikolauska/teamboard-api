'use strict';

var io       = require('../emitter');
var mongoose = require('mongoose');

/**
 * @class      Ticket
 * @classdesc  Mongoose model 'ticket'
 *
 * @param  {object}  ticket          ticket initialization object containing the
 *                                   required fields.
 * @param  {string}  ticket.heading  ticket heading
 * @param  {string}  ticket.content  ticket content
 *
 * @example
 * // position defaults to 0, 0, 0
 * // members can be passed in here
 * // note that owner is actually required
 * var ticket = new Ticket({ heading: 'h', content: 'c' });
 */
var TicketSchema = module.exports = new mongoose.Schema({

	/**
	 * Ticket heading containing the most pressuring information.
	 *
	 * @name  Ticket#heading
	 * @type  {string}
	 */
	heading: { type: String, required: true },

	/**
	 * The actual ticket content.
	 *
	 * @name  Ticket#content
	 * @type  {string}
	 */
	content: { type: String },

	/**
	 * XYZ Position of the ticket on it's containing 'board'
	 *
	 * @name  Ticket#position
	 * @type  {object}
	 */
	position: {
		x: { type: Number, default: 0 },
		y: { type: Number, default: 0 },
		z: { type: Number, default: 0 }
	},

	/**
	 * Color of the wind
	 *
	 * @name  Ticket#color
	 * @type  String
	 */
	color: { type: String },

	/**
	 * Owner of the ticket, who created it in the first place
	 *
	 * @name  Ticket#owner
	 * @type  {User}
	 */
	owner: {
		ref:      'user',
		type:     mongoose.Schema.Types.ObjectId,
		required: true
	},

	/**
	 * Members assigned to this ticket, can also include the owner
	 *
	 * @name  Ticket#members
	 * @type  {array<User>}
	 */
	members: [ { ref: 'user', type: mongoose.Schema.Types.ObjectId } ]
});

// setup transformations
if(!TicketSchema.options.toJSON) TicketSchema.options.toJSON = {};
if(!TicketSchema.options.toObject) TicketSchema.options.toObject = {};

// toJSON transformation
TicketSchema.options.toJSON.transform = function(doc, ret) {

	return {
		id:       ret._id,
		color:    ret.color,
		heading:  ret.heading,
		content:  ret.content,
		position: ret.position,
		owner:    ret.owner,
		members:  ret.members
	}
}

// toObject transformation is the same as toJSON
TicketSchema.options.toObject.transform = TicketSchema.options.toJSON.transform;

// check the owner actually exists
TicketSchema.pre('save', function(next) {

	if(!this.isModified('owner')) {
		return next();
	}

	mongoose.model('user').count({ _id: this.owner }, function(err, count) {

		if(err) {
			return next(err);
		}

		if(!count) {
			return next(new Error('Ticket owner not found'));
		}

		return next();
	});
});

// check members actually exist
TicketSchema.pre('save', function(next) {

	var ticket = this;

	if(!ticket.isModified('members')) {
		return next();
	}

	mongoose.model('user').find({ _id: { $in: ticket.members } },
		function(err, users) {

			if(err) {
				return next(err);
			}

			if(users.length !== ticket.members.length) {
				return next(new Error('Ticket member not found'));
			}

			return next();
		});
});
