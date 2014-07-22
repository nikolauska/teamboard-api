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
	 * The guests that can perform some limited actions on the board.
	 *
	 * @name  Board#guests
	 * @type  {array<Guest>}
	 */
	guests: [ require('./guest') ],

	/**
	 * Embedded 'ticket' models / documents. Tickets are not in their own
	 * collection and live directly inside a board.
	 *
	 * @name  Board#tickets
	 * @type  {array<Ticket>}
	 */
	tickets: [ require('./ticket') ],

	/**
	 * Screenshot information.
	 * @name  Board#tickets
	 * @type  {Screenshot}
	 */
	screenshot: {
		path:      { type: String },
		timestamp: { type: Date, default: Date.now }
	}
});

// setup transformations
if(!BoardSchema.options.toJSON) BoardSchema.options.toJSON = {};
if(!BoardSchema.options.toObject) BoardSchema.options.toObject = {};

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

// post updates to socket.io service
BoardSchema.post('save', function() {
	if(!this.isModified('tickets')) {
		io.to(this.id).emit('board:update', this.toObject());
	}
});

// post updates to socket.io service
BoardSchema.post('remove', function() {
	io.to(this.id).emit('board:remove', this.toObject());
});

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

BoardSchema.methods.isGuest = function(user) {
	var guests = this.populated('guests') || this.guests;
	var isGuest = _.find(guests, function(guest) {
		return guest == user.id;
	});
	return isGuest != undefined && isGuest != null;
}

BoardSchema.methods.updateScreenShot = function(callback) {

	var utils  = require('../../utils');
	var config = require('../index');

	var board = this;

	var now         = Date.now();
	var lastUpdated = board.screenshot.timestamp;

	if((now - lastUpdated) < config.staticContent.interval) {
		return callback();
	}

	utils.screenshot(board.id, board.tickets, function(err, path) {

		if(err) {
			return callback(err);
		}

		board.screenshot.path      = path;
		board.screenshot.timestamp = now;

		board.save(function(err, board) {

			if(err) {
				return callback(err);
			}

			return callback();
		});
	});
}
