
var express = require('express');
var path = require('path');
var static = require('serve-static');
var error = require('express-error-handler');
var handler = require('errorhandler');
var app = express();
var http = require('http').createServer(app);
// 쿠키 세션 //
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

// 파일업로드 모듈 :: S //
var multer = require('multer');
var cors = require('cors');
app.use(cors());
var fs = require('fs');
// 파일업로드 모듈 :: E //
var route_loader = require('./route/route_loader');
// 설정파일 모듈 :: S //
var config = require('./config');
var databaseloader = require('./database/database_loader');
// 설정파일 모듈 :: E //
var bodyParser = require('body-parser');
var router = express.Router();
var expressErrorHandler = require('express-error-handler');
var port = config.server_port;
var error = expressErrorHandler({
    static: {
        '404': 'public/error.html'
    }
})
// 비밀번호 암호화//
var crypto = require('crypto');
var pbkdf2 = require('pbkdf2-password');
var hasher = pbkdf2();

// passport 모듈 사용//
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var configPassport = require('./config/passport');
var userPassport = require('./config/routes/user_passport');
// 이미지 저장소 //
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'hgqrwcwqq',
    api_key: '969337824711988',
    api_secret: 'OsV8PviXKee5a0sHWCtM7jQv2R0'
});

// 경로 지정//
app.use(static(path.join(__dirname, 'public')));

// 노드메일//
var nodemailer = require('nodemailer');

// 노드sms;
var Nexmo = require('nexmo');
var nexmo = new Nexmo({
    apiKey: 'c2f04c4b',
    apiSecret: 'mvy3H3695hDHozpt'
});
var pagination = require('pagination');
var paginator = pagination.create('search', { prelink: '/', current: 1, rowsPerPage: 200, totalResult: 10020 });
//몽고디비//
var mongodb = require('mongodb').MongoClient;
var database;
/* 몽고데이터베이스 연결
function connectDB() {
    var databaseurl = 'mongodb://duatpwnd:duadksk9!!@ds143683.mlab.com:43683/heroku_vkj82j9h'
    mongodb.connect(databaseurl, { useNewUrlParser: true }, function (err, client) {
        console.log('몽고데이터베이스 연결');
        database = client.db('heroku_vkj82j9h');

    })
}
*/
// 몽구스 연결 //
var mongoose = require('mongoose');
// 뷰 엔진 설정 //
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// 라우터 응답을 보내기 위함//
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(flash());
// 쿠키,세션 미들웨어 등록//
app.use(cookieParser());
app.use(expressSession({
    // secret : 아무거나 처도되고 해킹의 위험을 줄이고자 주기적으로 바꿔주기 //
    secret: 'asdmvmkrmeklrvmle',
    // 세션을 저장할때 초기화 해줄건지 ?? //
    saveUninitialized: true,
    resave: true,
    // 쿠키저장시간 //
    cookie: { maxAge: 360000 }
}));
// passport 세션,이니셜라이즈 초기화 미들웨어 등록 위에설정한 session 보다 항상 아래에 위치하여아함 //
app.use(passport.initialize());
app.use(passport.session());


/*
//몽구스 사용자 추가 응답 라우터 //
router.route('/process/listuser').post(require('./route/router').userAdd);
// 로그인 성공시 페이지 //
router.route('/login/success').post(require('./route/router').loginSuccess);
// 비밀번호 이메일 전송//
router.route('/email/password').post(require('./route/router').email)
*/
// 파일 업로드 라우터 :: S //
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        if (month < 10) {
            month = '0' + month;
        }
        let day = date.getDate();
        fs.exists(__dirname + '/uploads/upload' + year + month + day, function (result) {
            if (result) {
                callback(null, __dirname + '/uploads/upload' + year + month + day);
            } else {
                fs.mkdirSync(__dirname + '/uploads/upload' + year + month + day);
                callback(null, __dirname + '/uploads/upload' + year + month + day);
            }
        })
    },
    filename: function (req, file, callback) {
        var extname = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extname);
        callback(null, basename + extname);
    }
})
var upload = multer({
    storage: storage,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
})
router.route('/chat/upload').post(upload.array('kakaoupload', 1), function (req, res) {
    console.log('/chat/upload 호출');
    console.log(req.files);
    // 비디오일 경우 //
    if (req.files[0].mimetype == 'video/webm' || req.files[0].mimetype == 'video/mp4') {
        cloudinary.v2.uploader.upload(req.files[0].path,
            { resource_type: "video",
              format:"webm",
              timeout:120000
            },
            function (error, result) {
                console.log('결과물');
                console.log(result, error)
                res.send({url:result.secure_url,type:result.resource_type});
            }
        )
    } else {
        // 이미지 저장소 //
        cloudinary.v2.uploader.upload(req.files[0].path,
            function (error, result) {
                console.log('eeee');
                console.log(result, error)
                res.send({url:result.secure_url,type:result.resource_type});
            }
        )
    }

})
// ckeditor 파일 업로드 //
router.route('/write/upload').post(upload.array('upload', 1), function (req, res) {
    console.log('upload호출');
    var files = req.files[0];
    console.log(files);
    console.log(req.query.CKEditorFuncNum);
    var tmpPath = files.path;
    var fileName = files.filename;
    var newPath = "./public/yo/local/" + fileName;
    fs.rename(tmpPath, newPath, function (err) {
        if (err) {
            console.log(err);
        }
        var html;
        html = "";
        html += "<script type='text/javascript'>";
        html += " var funcNum = " + req.query.CKEditorFuncNum + ";";
        html += " var url = \"/yo/local/" + files.filename + "\";";
        html += " var message = \"업로드 완료\";";
        html += " window.parent.CKEDITOR.tools.callFunction(funcNum, url);";
        html += "</script>";
        res.send(html);
        console.log(html);
    });
});

// 파일 업로드 라우터 :: S //
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads');
    },
    filename: function (req, file, callback) {
        var extname = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extname);
        callback(null, basename + Date.now() + extname);
    }
})
var upload = multer({
    storage: storage,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
})
router.route('/image/upload').post(upload.array('imgch1'), function (req, res) {
    console.log('upload호출');
    var files = req.files[0];
    //var fileName = files.filename;
    //var tmpPath = files.path;
    console.log(files);
    //var newPath = "./public/yo/upload/" + fileName;
    // 기존의 업로드 경로를 변경 //
    //fs.rename(tmpPath, newPath, function (err) {
    //});
    // 해당경로에 폴더가 있는지 없는지 확인//
    fs.exists(__dirname + '/uploads', function (result) {
        console.log(result);
        if (result) {
            return;
        } else {
            // 폴더가없으면 해당경로에 폴더 생성 // 'upload라는 폴더 생성' // 
            fs.mkdirSync(__dirname + '/uploads');
        }
    })
    // 이미지 저장소 //
    cloudinary.v2.uploader.upload(req.files[0].path,
        function (error, result) {
            console.log(result, error)
            res.send(result.secure_url);
        }
    )
});
// socket //
const io = require('socket.io')(http);
let obj = {};
io.on('connection', function (socket) {
    const socketid = socket.id;
    console.log('connect 호출');
    console.log(socketid);
    // io.to(socket.id).emit('change name', name);
    socket.on('disconnect', function () {
        console.log('disconnect 호출');
        let leave = obj[socket.id];
        delete obj[socket.id];
        io.emit('leave list', obj, leave);
        // 나간사람 //
    });
    socket.on('message', function (id, text) {
        var msg = text;
        io.emit('receive message', id, msg, socket.id);
    });
    socket.on('join', function (data) {
        obj[socket.id] = data;
        console.log(obj);
        io.emit('room list', obj, data);
    })
    socket.on('leave', function (data) {
        console.log(data);
    })
});
userPassport(router, passport);
route_loader(app, router);
configPassport(app, passport);

// 다중서버접속//
app.use(router);

http.listen(config.server_port, function (req) {
    console.log('익스프레스 서버 실행' + config.server_port);
    databaseloader(app, config);
})
