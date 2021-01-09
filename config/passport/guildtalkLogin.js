var LocalStrategy = require('passport-local').Strategy;
module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    var database = req.app.get('database');
    database.UserModel.findOne({ 'email': email }, function (err, user) {
        if (err) {
            console.log('로그인중 오류 발생');
            console.dir(err);
        }
        if (!user) {
            console.log('계정이 일치하지 않음');
            return done(null, false, req.flash('loginMessage', '아이디 또는 비밀번호가 일치하지 않습니다'));
        }
        var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
        if (!authenticated) {
            console.log('비밀번호 일치하지 않음');
            return done(null, false, req.flash('loginMessage', '아이디 또는 비밀번호가 일치하지 않습니다'));
        }
        console.log('로그인성공');
        done(null, user);
    })
})