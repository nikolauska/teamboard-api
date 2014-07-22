'use strict';


var passport = require('passport');

// initialize passport strategies
passport.use(require('./strategies/local'));
passport.use(require('./strategies/bearer'));

// expose passport
module.exports = passport;
