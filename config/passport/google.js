var google = require('passport-google-oauth20').Strategy;
var config = require('../../config');
module.exports = function (app, passport) {
    return new google({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        passReqToCallback: true,
    }, function (req, accessToken, refreshToken, profile, done) {
        // 수정사항 반영되나?..
        // 액세스 토큰은 계정으로 성공적으로 로그인 했음을 증명하는 암호문 형태의 증서
        // 엑세스 토큰은 유효기간이 짧다.. 엑세스 토큰이 만료되면 리프레쉬토큰이 엑세스 토큰을 갱신시켜준다 .. 
        // 보안상의 이유로 둘다 쓴다..
        // 만약 액세스 토큰이 노출되더라도 이 토큰은 유효기간이 짧기 때문에 해커는 이를 남용할 제한된 시간을 가지게 된다.
        // 만약 리프레시 토큰이 노출되더라도 이는 쓸모가 없다. 왜냐하면 액세스 토큰을 얻기 위해 해커는 클라이언트 id와 secret이 추가로 필요하기 때문이다.
        console.log('google호출');
        var database = app.get('database');


        // find 메소드와 findOne 메소드를 주의하자 find는 전체를 찾기때문에 배열형태로 결과물을 나타내고 findOne 하나만 찾기때문에 객체형태로 결과물을 보여준다. // 
        database.googleModel.findOne({ 'email': profile.emails[0].value }, function (err, result) {
            console.log(result);
            if (result) {
                console.log('google 인증 사용자 있음');
                return done(null, result);
            } else {
                database.UserModel.findOne({ 'email': profile.emails[0].value }, function (err, user) {
                    if (!user) {
                        var authUser = new database.UserModel({
                            'email': profile.emails[0].value
                        })
                        authUser.save(function (err) {
                        });
                    }
                });
                var googleUser = new database.googleModel({
                    'email': profile.emails[0].value
                })
                googleUser.save(function (err) {
                    console.log('google 사용자 저장됨');
                    return done(null, result);
                })
            }
        })
    })

}