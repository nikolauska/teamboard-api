'use strict';

var emitter  = require('./emitter');
var mongoose = require('mongoose');
var Board    = mongoose.model('board', require('../config/schemas/board'));
var Event    = mongoose.model('event', require('../config/schemas/event'));

module.exports = function(req) {

			var boardQuery = Board.find({'members.isActive': true}).populate('members.user');

			boardQuery.exec(function(err, boards) {
			if (!err) {
			boards.map(function(board) {

				var didChange = false;

				board.members.map(function(member) {
					if(Date.now() - member.lastSeen > 20000) {
						member.isActive = false;
						didChange = true;
					}
				})

				if(didChange) {
					board.save(function (err, savedboard) {
					new Event({
				'type': 'BOARD_EDIT',
				'board': savedboard.id,
				'data': {
					'newAttributes': {
						'name':             savedboard.name,
						'description':      savedboard.description,
						'background':       savedboard.background,
						'customBackground': savedboard.customBackground,
						'size': {
							'width':  savedboard.size.width,
							'height': savedboard.size.height,
						},
						'members':    savedboard.members
					}
				}
				}).save(function(err, ev) {
					if(err) {
						return console.error(err);
					}

					emitter.to(savedboard.id).emit('board:event', ev.toObject());
						});
					})
				}
			})

			}
	})
}
