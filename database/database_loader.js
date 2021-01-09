var mongoose = require('mongoose');
var database = function (app, config) {
    var databaseurl =
        // 헤로쿠 연동 // 
        //'mongodb://duatpwnd:duadksk9!!@ds143683.mlab.com:43683/heroku_vkj82j9h'//
        config.db_url
    mongoose.promise = global.promise;
    mongoose.connect(databaseurl, { useNewUrlParser: true, useCreateIndex: true });
    database = mongoose.connection;
    app.set('database', database);
    database.on('open', function () {
        console.log('몽구스연결');
        var curItem = config.db_schema[0];
        var curItem1 = config.db_schema1[0];
        var curItem2 = config.post_schema[0];
        var curItem3 = config.guild_schema[0];
        var google = config.google_schema[0];
        var naver = config.naver_schema[0];
        database.UserSchema = require(curItem.file)(mongoose);
        database.UserSchema1 = require(curItem1.file)(mongoose);
        database.PostSchema = require(curItem2.file)(mongoose);
        database.guild_schema = require(curItem3.file)(mongoose);
        database.googleSchema = require(google.file)(mongoose);
        database.naverSchema = require(naver.file)(mongoose);
        database.UserModel = mongoose.model(curItem.collection, database.UserSchema);
        database.UserModel1 = mongoose.model(curItem1.collection, database.UserSchema1);
        database.PostModel = mongoose.model(curItem2.collection, database.PostSchema);
        database.GuildModel = mongoose.model(curItem3.collection, database.guild_schema);
        database.googleModel = mongoose.model(google.collection,database.googleSchema);
        // 네이버 //
        database.naverModel = mongoose.model(naver.collection,database.naverSchema);
    })
    database.on('disconnected', function () {
        console.log('데이터베이스 연결 끊어짐')
        setInterval(function () {
            console.log('몽구스연결');
            var curItem = config.db_schema[0];
            var curItem1 = config.db_schema1[0];
            var curItem2 = config.post_schema[0];
            var curItem3 = config.guildmake_schema[0];
            database.UserSchema = require(curItem.file)(mongoose);
            database.UserSchema1 = require(curItem1.file)(mongoose);
            database.PostSchema = require(curItem2.file)(mongoose);
            database.UserModel = mongoose.model(curItem.collection, database.UserSchema);
            database.UserModel1 = mongoose.model(curItem1.collection, database.UserSchema1);
            database.PostModel = mongoose.model(curItem2.collection, database.PostSchema);
        }, 5000);
    })
}

module.exports = database;