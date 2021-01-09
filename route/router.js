// 파일 모듈 //
var fs = require('fs');
// 로그인 성공시 //
var loginSuccess = function (req, res) {
    var id = req.body.user_phone;
    var pw = req.body.user_pw;
    var database = req.app.get('database');
    database.UserModel.findById(id, function (err, result) {
        if (result.length > 0) {
            console.log('아이디 일치');
            console.log(result);
            var user = new database.UserModel();
            var auth = user.authenticate(pw, result[0].salt, result[0].hashed_password);
            if (auth) {
                console.log('비밀번호 일치');
                console.log(result);
                fs.readFile('public/yo/main.html', function (err, data) {
                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });
                    res.write('<script type="text/javascript">alert("로그인에 성공하셨습니다.");</script>');
                    res.write(data);
                    res.end();
                })

            } else {
                console.log('비밀번호 틀림');
                fs.readFile('public/yo/phone_login.html', function (err, data) {
                    res.writeHead('200', {
                        'Content-Type': 'text/html;charset=utf8'
                    });
                    res.write('<script type="text/javascript">alert("비밀번호가 틀리셨습니다.");</script>');
                    res.write(data);
                    res.end();
                })
            }
        } else {
            console.log('아이디 일치하는 사용자없음');
            console.log(result);
            fs.readFile('public/yo/phone_login.html', function (err, data) {
                res.writeHead('200', {
                    'Content-Type': 'text/html;charset=utf8'
                });
                res.write('<script type="text/javascript">alert("일치하는 아이디가 없습니다.");</script>');
                res.write(data);
                res.end();
            })
        }
    })
}


// 사용자 추가 //
var userAdd = function (req, res) {
    var id = req.body.user_phone;
    var pw = req.body.user_pw;
    var database = req.app.get('database');
    if (database) {
        mongooseAuthuser(database, id, function (err, result) {
            if (err) {
                console.log(err);
            }
            if (result) {
                console.log(result);
                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' });
                req.app.render('phone_join', function (err, html) {
                    if (err) {
                        console.log('뷰 렌더링중 오류 발생');
                        console.log(err);
                    }
                    res.write(html);
                    res.end();
                })
            } else {
                mongooseAddUser(database, id, pw, function (err, result) {
                    if (result) {
                        console.log(result);
                        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8' });
                        req.app.render('main', function (err, html) {
                            if (err) {
                                console.log('뷰 렌더링중 오류 발생');
                            }
                            res.write(html);
                            res.end();
                        })
                    }
                })
            }
        })
    }
}


// 몽구스 로그인시 사용자 추가 함수 // 
function mongooseAddUser(database, id, pw, callback) {
    var user = new database.UserModel({ 'id': id, 'pw': pw });
    user.save(function (err) {
        if (err) {
            callback(err, null);
            console.log('에러발생bbbb');
            console.dir(err);
            return;
        }
        callback(null, user);
    })
}
// 몽구스 로그인시 사용자 일치 여부 // 
function mongooseAuthuser(database, email, callback) {
    database.UserModel.findByEmail(email, function (err, result) {
        if (result.length > 0) {
            console.log('아이디 일치하는 사용자있음');
            callback(null, result);

        } else {
            console.log('아이디 일치하는 사용자없음');
            callback(null, null);
        }
    })
}


module.exports.loginSuccess = loginSuccess;
module.exports.userAdd = userAdd;
