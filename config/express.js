'use strict';

var app    = require('express')();
var config = require('./index');

if(config.env === 'development') {
	app.use(require('morgan')({ format: 'dev' }));
}

app.use(require('body-parser')());
app.use(require('method-override')());

module.exports = app;
