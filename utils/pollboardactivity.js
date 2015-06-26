'use strict';

var mongoose = require('mongoose');
var Board = mongoose.model('board', require('../config/schemas/board'));

module.exports = function() {
			Board.find({'members.isActive': true}, function(err, boards) {
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
					board.save(function (err) {
					  if (err) console.log(err)
					  // saved!
					})
				}
			})

			}
	})
}