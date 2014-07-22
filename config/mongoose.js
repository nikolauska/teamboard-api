'use strict';


var mongoose = require('mongoose');

// bootstrap mongoose models
mongoose.model('user',  require('./schemas/user'));
mongoose.model('board', require('./schemas/board'));

// expose mongoose
module.exports = mongoose;
