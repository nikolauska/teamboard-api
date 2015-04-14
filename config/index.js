 'use strict';

var _ = require('lodash');

var config = {

	common: {

        env: process.env.NODE_ENV || 'development',

		port: process.env.PORT || 9002,

        token: {
            secret: 'secret'
        },

        mongo: {
			options: { safe: true }
		},

        redis: {
            host: 'localhost',
            port: 6379
        }
	},

    test: {
        mongo: {
            url: 'mongodb://localhost/teamboard-test'
        }
    },

    development: {
        mongo: {
            url: 'mongodb://localhost/teamboard-development'
        }
    },

	production: {

        token: {
            secret: process.env.TOKEN_SECRET
        },

		mongo: {
			url: process.env.MONGODB_URL
		},

		redis: {
            opts: {
                auth_pass: process.env.REDIS_PASS
            },
			host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
		}
    }
}

/**
 *  Configuration based on 'NODE_ENV'.
 */
module.exports = _.merge(config.common,
	config[process.env.NODE_ENV] || config.development);
