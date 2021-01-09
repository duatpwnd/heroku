var LocalStrategy = require('passport-local').Strategy;
module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    console.log('요청들어왔다');
    var database = req.app.get('database');
    database.UserModel.findOne({ 'email': email }, function (err, user) {
        if (err) {
            console.log('계정조회중 오류발생');
            console.dir(err);
            return done(err);
        }
        if (user) {
            console.log('이미존재');
            done(null, false, req.flash('signupMessage', '이미 존재하는 이메일 주소입니다.'));
        } else {
            var user = new database.UserModel({ 'email': email, 'password': password});
            user.save(function (err) {
                if (err) {
                    console.log('err 발생');
                    console.dir(err);
                }
                console.log('추가성공');
                return done(null, user);
            })
        }
    })
});