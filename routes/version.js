'use strict';
var middleware  = require('../middleware');
var Router      = require('express').Router();

Router.route('/version')
    .get(middleware.authenticate('user', 'guest'))
    .get(function(req, res) {
        var version = process.env.VERSION || 'unknown';
        version = '{"version":"'+version+'"}'
        return res.json(200, JSON.parse(version));
    });
module.exports = Router;
