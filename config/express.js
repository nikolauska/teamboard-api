/**
 * Configures our ExpressJS application.
 *
 * @module  config/express
 */

'use strict';


var app    = require('express')();
var config = require('./index');

if(config.env === 'development') {
	app.use(require('morgan')({ format: 'dev' }));
}

app.use(require('body-parser')());
app.use(require('method-override')());


/**
 * ExpressJS application.
 *
 * @type  {object}
 */
module.exports = app;
