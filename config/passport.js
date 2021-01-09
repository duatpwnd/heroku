var localsignup = require('./passport/local_signup');
var guildtalkLogin = require('./passport/guildtalkLogin');
var facebook = require('./passport/facebook');
var google = require('./passport/google');
var naver = require('./passport/naver')
// passport strategy 설정 //
module.exports = function (app,passport) {
    // 사용자 정보를 세션에 저장 //
    // 로그인 성공후 값이 user라는 인자를 통해서 전달되는데, 이 값을 done(null,user)로 넣으면 HTTP session내에 저장된다

    passport.serializeUser(function (user, done) {
        console.log('serializeUser()호출됨');
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        console.log('deserializeUser()호출됨');
        done(null, user);
    });
    passport.use('local-signup',localsignup);
    passport.use('naver',naver(app,passport));
    passport.use('guildtalkLogin',guildtalkLogin);
    passport.use('facebook',facebook);
    passport.use('google',google(app,passport));
}