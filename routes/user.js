var _        = require('lodash');
var express  = require('express');
var mongoose = require('mongoose');

var utils      = require('../utils');
var config     = require('../config');
var middleware = require('../middleware');

var User   = mongoose.model('user');

var Router   = express.Router();
var ObjectId = mongoose.Types.ObjectId;

Router.route('/user/edit')

    /**
     * Change user name and password
     *
     * {
     *   'name':     'new name'
     *   'password': 'new password'
     * }
     */
    .post(middleware.authenticate('user'))
    .post(function(req, res, next) {
        var payload = req.body;

        User.findOne({ '_id': req.user.id }, function(err, user) {
            if(err) {
                return next(utils.error(500, err));
            }

            if(!user) {
                return next(utils.error(500, 'User not found'));
            }

            user.name                    = payload.name;
            user.provider.basic.password = payload.password;
            user.edited_at               = Date.now();

            user.save(function(err, user) {
                if(err) {
                    if(err.name == 'ValidationError') {
                        return next(utils.error(400, err));
                    }
                    return next(utils.error(500, err));
                }
                return res.json(201, user);
            });
        });     
    });

module.exports = Router;