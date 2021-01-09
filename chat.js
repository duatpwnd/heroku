var http = require('http');
var express = require('express');
var path = require('path');
var static = require('serve-static');
var error = require('express-error-handler');
var handler = require('errorhandler');
var app = express();
// 파일업로드 모듈 :: S //
var multer = require('multer');
var cors = require('cors');
var fs = require('fs');
// 파일업로드 모듈 :: S //
// socket //
var socketio = require('socket.io');
var bodyParser = require('body-parser');
var router = express.Router();
var expressErrorHandler = require('express-error-handler');
var port = process.env.PORT || 3000;
var error = expressErrorHandler({
    static: {
        '404': 'public/error.html'
    }
})

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(static(path.join(__dirname, 'public')));
app.use(cors());

var storage = multer.diskStorage({
    destination: function(req,file,callback){
        callback(null,'uploads');
    },
    filename:function(req,file,callback){
        callback(null,file.originalname+Date.now())
    }
})
var upload = multer({
    storage:storage,
    limits:{
        files:10,
        fileSize:1024*1024*1024
    }
})
router.route('/process').post(upload.array('photo',5),function(req,res){
    res.writeHead(200,{'Content-Type':'text/html;charset=utf8'});
    res.write('<body><div id="wrap"><div class="menu_wrap"><ul><li class="top">메뉴<img src="images/bigclose.png" alt="닫기" title="닫기" class="close" onclick="disappear();"></li><li><a href="invite.html">대화상대초대<span>></span></a></li><li><a href="#">나가기<span>></span></a></li></ul></div><header><a href="#" class="back"><img src="images/back.png" alt="뒤로가기" title="뒤로가기"></a><h1>그룹채팅방</h1><a href="#" class="menu" onclick="menu();"><img src="images/menu.png" alt="메뉴" title="메뉴"></a></header><section></section><div class="message_wrap"><div class="message_send"><form enctype="multipart/form-data" action="/process" method="post"><label id="upload"><span></span></label><input type="file" name="photo" for="upload" class="upload_btn" multiple></form><textarea class="message_enter" placeholder="메세지를 입력해 주세요" rows="1" autofocus></textarea><a href = "#" class="send_btn">전송</a></div><footer><ul><li><a href="#" class="friend_btn"><img src="images/friend.png" alt="친구" title="친구"></a></li><li><a href="#" class="talk_btn"><img src="images/talk.png" alt="채팅" title="채팅"></a></li><li><a href="#" class="guild_btn"><img src="images/guild.png" alt="길드" title="길드"></a></li><li><a href="#" class="game_btn"><img src="images/game.png" alt="게임" title="게임"></a></li></ul></footer></div></div></body>');
    res.end();
})
router.route('/login').post(function (req, res) {
    var id = req.body.id;
    var pw = req.body.pw;
    res.writeHead('200', {
        'Content-Type': 'text/html;charset=utf8'
    });
    res.write(id);
    res.write(pw);
    res.end();
})

app.use(router);

var server = http.createServer(app).listen(port, function () {
    console.log('익스프레스 서버 실행');
})
var io = socketio.listen(server);
console.log('socket.io 요청을 받아들일 준비가 되었습니다.');
io.sockets.on('connection',function(socket){
   
   socket.on('message',function(message){
       console.log('message 이벤트를 받았습니다.');
       console.dir(message);
       if(message.recepient == 'ALL'){
           io.sockets.emit('message',message);
       }
   })
   
});

