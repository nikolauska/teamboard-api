'use strict';

var mongoose = require('mongoose');
var emitter  = require('./emitter');
var Promise  = require('promise');
var Event    = mongoose.model('event', require('../config/schemas/event'));

module.exports = function(board) {

        return function(ticket) {
            return new Promise(function(resolve, reject) {

                var ticketWidth = 192;
                var ticketHeight = 108;

                var oldPosition = {x: ticket.position.x, y: ticket.position.y};

                if(ticket.position.x > (board.size.width * ticketWidth) - ticketWidth / 2){
                    ticket.position.x = (board.size.width * ticketWidth) - ticketWidth;
                }

                if(ticket.position.y > (board.size.height * ticketHeight) - ticketHeight / 2){
                    ticket.position.y = (board.size.height * ticketHeight) - ticketHeight;
                }

                ticket.save(function(err) {
                    // we've saved the dog into the db here
                    if (err) return reject(err);

                    new Event({
                        'type': 'TICKET_EDIT',
                        'board': ticket.board,
                        'data': {
                            'id': ticket._id,
                            'oldAttributes': {
                                'color':    ticket.color,
                                'heading':  ticket.heading,
                                'content':  ticket.content,
                                'position': oldPosition,
                            },

                            'newAttributes': {
                                'color':    ticket.color,
                                'heading':  ticket.heading,
                                'content':  ticket.content,
                                'position': ticket.position,
                            },
                        }
                    }).save(function(err, ev) {
                            if(err) {
                                return console.error(err);
                            }
                            emitter.to(ev.board)
                                .emit('board:event', ev.toObject());
                            return resolve();
                        });

                });

            });
        }
}
