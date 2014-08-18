'use strict';

var mongoose = require('mongoose');

mongoose.model('user',  require('./schemas/user'));
mongoose.model('board', require('./schemas/board'));

module.exports = mongoose;
