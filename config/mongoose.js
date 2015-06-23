'use strict';

var mongoose = require('mongoose');

mongoose.model('user',   require('./schemas/user'));
mongoose.model('event',  require('./schemas/event'));
mongoose.model('board',  require('./schemas/board'));
mongoose.model('ticket', require('./schemas/ticket'));
mongoose.model('session', require('./schemas/session'));

module.exports = mongoose;
