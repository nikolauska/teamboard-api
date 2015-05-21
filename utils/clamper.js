'use strict';

var Promise = require('promise');

module.exports = function(board) {

        return function(ticket) {
            return new Promise(function(resolve, reject) {

                var tempPosition = {x: ticket.position.x, y: ticket.position.y};

                if(ticket.position.x > (board.size.width * 192) - 96){
                    tempPosition.x = (board.size.width * 192) - 192;
                }

                if(ticket.position.y > (board.size.height * 108) - 54){
                    tempPosition.y = (board.size.height * 108) - 108;
                }

                ticket.position = tempPosition;
                ticket.save(function(err) {
                    // we've saved the dog into the db here
                    if (err) throw err;
                });
            });
        }
}