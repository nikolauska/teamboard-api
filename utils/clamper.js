'use strict';

var Promise = require('promise');

module.exports = function(board) {

        return function(ticket) {
            return new Promise(function(resolve, reject) {
                console.log(ticket.id);
            });
        }
}