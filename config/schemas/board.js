'use strict';

var mongoose = require('mongoose');

/**
 * Schema defining the 'board' model.
 */
var BoardSchema = module.exports = new mongoose.Schema({

	/**
	 * The board's display name.
	 */
	name: {
		type:     String,
		required: true
	},

	/**
	 * Description of the board.
	 */
	description: {
		type:    String,
		default: ''
	},

	/**
	 * Size of the board, in the unit of 'tickets'. Eg. a width of 8 would
	 * imply the board is as wide as 8 tickets.
	 */
	size: {
		width: {
			type:    Number,
			default: 8
		},
		height: {
			type:    Number,
			default: 8
		}
	},

	/**
	 * Background image used on the board.
	 *
	 * TODO Enumerate this property. Should we store the background image in
	 *      database in base64 format?
	 */
	background: {
		type:    String,
		default: 'none'
	},

	/**
	 * Reference (ObjectId) of the 'user' who created this board.
	 */
	createdBy: {
		ref:      'user',
		type:     mongoose.Schema.Types.ObjectId,
		required: true
	},

	/**
	 * The 'access-code' that can be used by 'guests' to generate an
	 * 'access-token' to this board. The generated 'access-tokens' are tied to
	 * the 'access-code', so refreshing or emptying this will render the
	 * generated 'access-tokens' invalid.
	 */
	accessCode: {
		type: String
	}
});

if(!BoardSchema.options.toJSON) BoardSchema.options.toJSON     = { }
if(!BoardSchema.options.toObject) BoardSchema.options.toObject = { }

BoardSchema.options.toJSON.transform = function(doc, ret) {
	ret.id = doc.id;

	delete ret._id;
	delete ret.__v;
}

/**
 * BUG 'Model.save' invokes 'transform.toObject' internally, resulting in a
 *     missing '_id' and a failed save in our case.
 *
 * version(s) affected:
 *   mongoose 3.8.17
 *
 * solution:
 *   Use another version for now. If the behavior is intended we can remove
 *   the 'toObject' usage from our code and use 'toJSON' internally with
 *   'JSON.parse' or some other hack.
 *
 * related issue:
 *   https://github.com/LearnBoost/mongoose/issues/2355
 */
BoardSchema.options.toObject.transform = BoardSchema.options.toJSON.transform;
