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
    port: process.env.PORT || 9002,
    img:  process.env.IMG_URL || 'http://localhost:9003/img',
    providers: {
        google: {
            clientID:     process.env.GOOGLE_CLIENT_ID || '161571982407-o698t9ofu4nl56efcu3dkl2f2nftb5du.apps.googleusercontent.com',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'Dd0Me0lL3HT4k8vCdMfvBXBa',
            callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:9002/api/auth/google/callback'
        },
        github: {
            clientID:     process.env.GITHUB_CLIENT_ID || '4091c94abf2d7db856c3',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '41d9babec7bab84964cdea6c7784f8434b14d1d8',
            callbackURL:  process.env.GITHUB_CALLBACK_URL || 'http://localhost:9002/api/auth/github/callback'
        }
    }
}
