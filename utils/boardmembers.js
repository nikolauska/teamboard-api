/**
 * Created by matti on 26.6.2015.
 */
'use strict';

var mongoose = require('mongoose');
var Board = mongoose.model('board', require('../config/schemas/board'));

module.exports = function resolveBoardMembers(boardId) {
    var boardQuery = Board.findById(boardId).populate('members.user');

    boardQuery.exec(function(err, board) {
        if(err) {
            return null;
        }
        return board.members
    });

}