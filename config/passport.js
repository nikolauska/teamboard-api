'use strict';

var passport = require('passport');

passport.use(require('./strategies/local'));
passport.use(require('./strategies/bearer'));
passport.use(require('./strategies/anonymous'));

module.exports = passport;
