 'use strict';

/**
 * The common environmental configuration of the server application.
 *
 * @module  config/common
 */

var _    = require('lodash');
var path = require('path');

var config = {
	common: {

        env: process.env.NODE_ENV || 'development',

		port: process.env.PORT || 9002,

        token: {
            expiration: 60 * 24
        },

        mongo: {
			options: { safe: true }
		},

        staticContent: {
            dir:      'static/',
            template: 'assets/board.jade',
            interval: 5
        }
	},

    development: {

        token: {
            secret: 'teamboard-secret'
        },

        mongo: {
			host: 'mongodb://localhost/teamboard-dev'
		},

        redis: {
			host: 'localhost',
            port: 6379
		}
	},

	production: {

        token: {
            secret: process.env.TOKEN_SECRET
        },

		mongo: {
			host: process.env.MONGODB_HOST
		},

		redis: {
			host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
		}
	}
}

module.exports = _.merge(config.common,
	config[process.env.NODE_ENV] || config.development);
