module.exports = {
    server_port: process.env.PORT || 8100,
    db_url: 'mongodb://duatpwnd:duadksk9!!@ds143683.mlab.com:43683/heroku_vkj82j9h',
    db_schema: [
        { file: './mongoose_schema', collection: 'users7', schemaName: 'UserSchema', modelName: 'UserModel' }
    ],
    db_schema1: [
        { file: './facebook_schema', collection: 'facebook', schemaName: 'UserSchema1', modelName: 'UserModel1' }
    ],
    google_schema: [
        { file: './google_schema', collection: 'google', schemaName: 'google', modelName: 'google' }
    ],
    naver_schema: [
        { file: './naver_schema', collection: 'naver', schemaName: 'naver', modelName: 'naver' }
    ],
    post_schema: [
        { file: './post_schema', collection: 'writeSave', schemaName: 'PostSchema', modelName: 'PostModel' }
    ],
    guild_schema: [
        { file: './guild_schema', collection: 'guildmake', schemaName: 'guildMakeSchema', modelName: 'guildMakeModel' }
    ],
    router_info: [
        {
            file: './router', path: '/process/listuser', type: 'post', method: 'userAdd'
        },
        {
            file: './router', path: '/login/success', type: 'post', method: 'loginSuccess'
        },
        {
            file: '../config/routes/post', path: '/write/success', type: 'post', method: 'addpost'
        },
        {
            file: '../config/routes/post', path: '/guildtalk/read', type: 'get', method: 'listPost'
        },
        {
            file: '../config/routes/post', path: '/add/comment', type: 'post', method: 'addComment'
        },
        {
            file: '../config/routes/post', path: '/remove/comment', type: 'get', method: 'removeComment'
        },
        {
            file: '../config/routes/post', path: '/modify/comment', type: 'post', method: 'modifyComment'
        },
        {
            file: '../config/routes/post', path: '/reply/comment', type: 'post', method: 'replyComment'
        },
        {
            file: '../config/routes/post', path: '/guildtalk/guildadd', type: 'post', method: 'guildMake'
        },
        {
            file: '../config/routes/post', path: '/email/password', type: 'post', method: 'email'
        },
        {
            file: '../config/routes/post', path: '/comment/order', type: 'post', method: 'commentorder'
        },
        {
            file: '../config/routes/post', path: '/the/latest', type: 'post', method: 'thelatest'
        }

    ],
    facebook: {
        clientID: '261286634589311',
        clientSecret: '3dbc0d2d2515420d1fd69ddf9d249517',
        callbackURL: '/auth/facebook/callback'
    },
    google: {
        clientID: '1089429426531-3aavnjm22a3267k6j1mtf1tmkv7t9r7t.apps.googleusercontent.com',
        clientSecret: 'iZxuR6RGxfnmiWmLA3NftZRX',
        callbackURL: '/auth/google/callback'
    },
    naver: {
        clientID: 'hzrr9teL6HGerNLK4CLO',
        clientSecret: 'DwfCUX_H38',
        callbackURL: '/auth/naver/callback'
    }
}