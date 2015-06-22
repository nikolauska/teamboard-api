var middleware  = require('../middleware');
var Router      = require('express').Router();

const IMG_URL = process.env.IMG_URL || 'http://localhost:9003';

Router.route('/version/api')
    .get(middleware.authenticate('user', 'guest'))
    .get(function(req, res) {
        var version = process.env.VERSION || 'unknown';
        version = '{"version":"'+version+'"}'
        return res.json(200, JSON.parse(version));
    });

Router.route('/version/img')
    .get(middleware.authenticate('user', 'guest'))
    .get(function(req, ress) {
        var version = '{"version":"unknown"}';
        request.get(IMG_URL+'/version')
            .end(function(err, res){
                version = '{"version":"'+res.body.version+'"}';
                return ress.json(200, JSON.parse(version));
            });
    });

module.exports = Router;
