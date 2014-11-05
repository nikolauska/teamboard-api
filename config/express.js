'use strict';

var app    = require('express')();
var config = require('../config');

if(config.env == 'development') {
	app.use(require('morgan')({ format: 'dev' }));
}

app.set('json spaces', 2);

app.use(require('body-parser')());
app.use(require('method-override')());

module.exports = app;
