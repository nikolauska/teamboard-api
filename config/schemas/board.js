'use strict';


var _        = require('lodash');
var io       = require('../emitter');
var mongoose = require('mongoose');

/**
 * @class Board
 * @classdesc Mongoose model 'board'
 *
 * @param  {object}  board          board initialization object
 * @param  {string}  board.name     board name
 * @param  {string}  board.info     board information, description
 *
 * @example
 * // members can be passed in here
 * // note that owner is actually required
 * var board = new Board({ name: 'a', info: 'b' });
 */
var BoardSchema = module.exports = new mongoose.Schema({

	/**
	 * Board name.
	 *
	 * @name  Board#name
	 * @type  {string}
	 */
	name: { type: String, required: true },

	/**
	 * Board info or description, whatever man.
	 *
	 * @name  Board#info
	 * @type  {string}
	 */
	info: { type: String },

	/**
	 * Marks the board as public, so it shows to all users.
	 *
	 * @name  Board#isPublic
	 * @type  {boolean}
	 */
	isPublic: { type: Boolean, default: false },

	/**
	 * Owner of the board, the major overlord.
	 *
	 * @name  Board#owner
	 * @type  {User}
	 */
	owner: {
		ref:      'user',
		type:     mongoose.Schema.Types.ObjectId,
		required: true
	},

	/**
	 * The members that can view and perform actions on the board.
	 *
	 * @name  Board#members
	 * @type  {array<User>}
	 */
	members: [ { type: mongoose.Schema.Types.ObjectId, ref: 'user' } ],

	/**
	 * Embedded 'ticket' models / documents. Tickets are not in their own
	 * collection and live directly inside a board.
	 *
	 * @name  Board#tickets
	 * @type  {array<Ticket>}
	 */
	tickets: [ require('./ticket') ]
});

// setup transformations
if(!BoardSchema.options.toJSON) BoardSchema.options.toJSON     = { }
if(!BoardSchema.options.toObject) BoardSchema.options.toObject = { }

// toJSON transformation
BoardSchema.options.toJSON.transform = function(doc, ret) {

	// set the id attribute
	ret.id = doc.id;

	// remove internal attributes
	delete ret._id;
	delete ret.__v;
}

// toObject transformation is the same as toJSON
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
