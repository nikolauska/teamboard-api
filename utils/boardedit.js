'use strict';
var emitter  = require('./emitter');
var mongoose = require('mongoose');
var Event = mongoose.model('event', require('../config/schemas/event'));

module.exports = function(req, board, old) {

    new Event({
        'type': 'BOARD_EDIT',
        'board': board.id,
        'user':  {
            'id':       req.user.id,
            'type':     req.user.type,
            'username': req.user.username,
        },
        'data': {
            'oldAttributes': {
                'name':             old.name,
                'description':      old.description,
                'background':       old.background,
                'customBackground': old.customBackground,
                'size': {
                    'width':  old.size.width,
                    'height': old.size.height,
                }
            },
            'newAttributes': {
                'name':             board.name,
                'description':      board.description,
                'background':       board.background,
                'customBackground': board.customBackground,
                'size': {
                    'width':  board.size.width,
                    'height': board.size.height,
                }
            }
        }
    }).save(function(err, ev) {
            if(err) {
                return console.error(err);
            }
            emitter.to(board.id).emit('board:event', ev.toObject());
        });

}