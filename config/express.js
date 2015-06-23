'use strict';

var app    = require('express')();
var config = require('../config');
var passport = require('passport');

if(process.env.NODE_ENV == 'development') {
	app.use(require('morgan')({ format: 'dev' }));
}

app.set('json spaces', 2);

app.use(require('body-parser')({ 'limit': '1000kb' }));
app.use(require('method-override')());
app.use(passport.initialize());

module.exports = app;
