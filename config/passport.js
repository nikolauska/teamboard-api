'use strict';

var passport = require('passport');

passport.use('user',  require('./strategies/user'));
passport.use('guest', require('./strategies/guest'));
passport.use('local', require('./strategies/local'));

module.exports = passport;
