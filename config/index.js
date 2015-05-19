 'use strict';

module.exports = {
    mongo: {
        opts: {
            safe: true
        },
        url: process.env.MONGODB_URL || 'mongodb://localhost/test'
    },
    redis: {
        opts: {
            auth_pass: process.env.REDIS_PASS
        },
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || '127.0.0.1'
    },
    token: {
        secret: process.env.TOKEN_SECRET || 'secret'
    },
    port: process.env.PORT || 9002
}
