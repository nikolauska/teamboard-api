var middleware  = require('../middleware');
var Router      = require('express').Router();
var request     = require('superagent');

const IMG_URL = process.env.IMG_URL || 'http://localhost:9003';

Router.route('/version/api')
    .get(middleware.authenticate('user', 'guest'))
    .get(function(req, res) {
        var version = process.env.VERSION || 'unknown';
        version = {"version":version};
        return res.json(200, version);
    });

Router.route('/version/img')
    .get(middleware.authenticate('user', 'guest'))
    .get(function(req, res) {
        var version = {"version":"unknown"};
        request.get(IMG_URL+'/version')
            .end(function(err, response){
                version = {"version":response.body.version};
                return res.json(200, version);
            });
    });

module.exports = Router;
