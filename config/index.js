 'use strict';

module.exports = {
    mongo: {
        opts: {
            safe: true
        },
        url:             process.env.MONGODB_URL      || 'mongodb://localhost/test',
        timeout:         process.env.MONGODB_TIMEOUT  || 5000,
        purge_interval:  process.env.MONGODB_PURGE    || '* * * * * *',
        guest_exp_time:  process.env.MONGODB_GUEST_EXP || 604800
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
    port:        process.env.PORT || 9002,
    img:         process.env.IMG_URL || 'http://localhost:9003/img',
    providers: {
        google: {
            clientID:     process.env.GOOGLE_CLIENT_ID || ' ',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ' ',
            callbackURL:  process.env.GOOGLE_CALLBACK_URL || ' '
        },
        facebook: {
            clientID:     process.env.FACEBOOK_CLIENT_ID || ' ',
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET || ' ',
            callbackURL:  process.env.FACEBOOK_CALLBACK_URL || ' '
        },
        github: {
            clientID:     process.env.GITHUB_CLIENT_ID || ' ',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || ' ',
            callbackURL:  process.env.GITHUB_CALLBACK_URL || ' '
        }
    }
}
