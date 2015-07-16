'use strict';

var passport = require('passport');

passport.use('user',  require('./strategies/user'));
passport.use('guest', require('./strategies/guest'));
passport.use('basic', require('./strategies/basic'));
passport.use('google', require('./strategies/google'));
passport.use('github', require('./strategies/github'));
passport.use('facebook', require('./strategies/facebook'));

module.exports = passport;
