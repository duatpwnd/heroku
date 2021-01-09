var facebookStrategy = require('passport-facebook').Strategy;
var config = require('../../config');
var date = new Date();
var year = date.getFullYear();
var month = date.getMonth() + 1;
var day = date.getDate();
var Hours = date.getHours();
var minutes = date.getMinutes();
var seconds = date.getSeconds();
if (minutes < 10) {
    minutes = '0' + minutes;
}
module.exports = 
     new facebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone',
            'updated_time', 'verified', 'displayName']
    }, function (accessToken, refreshToken, profile, done) {
        console.log('passport facebook 호출');
        console.dir(profile);
        var database = app.get('database');
        database.UserModel1.findOne({ 'email': profile.emails[0].value }, function (err, user) {
            if (user) {
                console.log('페이스북 인증된 사용자가 있음');
                done(null, user);
            } else {
                var user = new database.UserModel1({
                    'email': profile.emails[0].value
                });
                user.save(function (err) {
                    if (err) {
                        console.log('페이스북 인증 저장중 에러발생');
                        console.dir(err);
                    }
                    console.log('페이스북에 인증 저장됨');
                    done(null, user);
                })
            }
        })
    })

