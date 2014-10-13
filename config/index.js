 'use strict';

var _ = require('lodash');

var config = {
	common: {

        env: process.env.NODE_ENV || 'development',

		port: process.env.PORT || 9002,

        token: {
            expiration: 60 * 24
        },

        mongo: {
			options: { safe: true }
		}
	},

    development: {

        token: {
            secret: 'teamboard-secret'
        },

        mongo: {
			url: 'mongodb://localhost/teamboard-dev'
		},

        redis: {
			host: 'localhost',
            port: 6379
		},

        static: {
            url:  'http://localhost',
            port: 9003
        },

        crypto: {
            url:  'http://localhost',
            port: 9004
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
			host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
		},

        static: {
            url:  process.env.STATIC_URL,
            port: process.env.STATIC_PORT
        },

        crypto: {
            url:  process.env.CRYPTO_URL,
            port: process.env.CRYPTO_PORT
        }
	}
}

// Quick hack to enable a 'test' environment.
config.test = config.development;

/**
 *  Configuration based on 'NODE_ENV'.
 */
module.exports = _.merge(config.common,
	config[process.env.NODE_ENV] || config.development);
