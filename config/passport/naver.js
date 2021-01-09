const NaverStrategy = require("passport-naver").Strategy;
const config = require("../../config");
module.exports = function (app, passport) {
    return new NaverStrategy(
        {
            clientID: config.naver.clientID,
            clientSecret: config.naver.clientSecret,
            callbackURL: config.naver.callbackURL,
            passReqToCallback: true
        },
        function (req,accessToken, refreshToken, profile, done) {
            const database = app.get("database");
            database.naverModel.findOne({ 'email': profile._json.email }, function (err, result) {
                console.log(result);
                if (result) {
                    console.log('네이버 인증 사용자 있음');
                    return done(null, result);
                } else {
                    database.naverModel.findOne({ 'email': profile._json.email  }, function (err, user) {
                        if (!user) {
                            var authUser = new database.naverModel({
                                'email': profile._json.email 
                            })
                            authUser.save(function (err) {
                            });
                        }
                    });
                    var naverUser = new database.naverModel({
                        'email': profile._json.email
                    })
                    naverUser.save(function (err) {
                        console.log('네이버 사용자 저장됨');
                        return done(null, result);
                    })
                }
            })
        }
    );
};
