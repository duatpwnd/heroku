// entities 사용하는이유 : &nbsp, &lt, &gt 등등 제거하기위해서 //
var entities = require('html-entities').AllHtmlEntities;
// 노드메일//
var nodemailer = require('nodemailer');
// 게시글 추가 //
var moment = require('moment');
var addpost = function (req, res) {
    var time = moment().format('YYYY-MM-DD HH:mm:ss');
    var update = moment().format('YYYY-MM-DD HH:mm');
    var paramTitle = req.body.title;
    var paramContents = req.body.contents
    var paramWriter = req.body.writer;
    var guildname = req.query.guildname;
    var guildid = req.query.guildid;
    var database = req.app.get('database');
    var board = req.body.board;
    database.GuildModel.find({ '_id': guildid }, function (err, guild) {
        database.UserModel.find({ 'email': paramWriter }, function (err, result) {
            if (err) {
                console.log('게시판 글 추가중 오류발생');
                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8;' })
                res.write('<h1>게시판 글 추가중 오류발생</h1>');
                res.end();
            }
            var PostModel = new database.PostModel({
                title: paramTitle,
                contents: paramContents,
                writer: result[0]._id,
                email: result[0].email,
                created_at: time,
                updated_at: update,
                guildType: guildname,
                guildKind: board,
                owner: guild[0].maker
            })
            PostModel.save(function (err) {
                if (err) {
                    console.log('글 저장중 에러발생');
                    console.log(err);
                }
                res.redirect('/guildtalk/guildmaster/?page=1&guildid=' + guildid + '&guildname=' + guildname + '');
            })
        })
    })
}
// 게시글 읽기 //
var listPost = function (req, res) {
    // r 는 object_id 값을 조회//
    var r = req.query.read;
    var database = req.app.get('database');
    database.PostModel.find({ '_id': r }, function (err, result) {
        var context = {
            result: result,
            userSession: req.user,
            entities: entities,
        }
        req.app.render('read', context, function (err, html) {
            if (err) {
                console.log('표시중 에러발생');
                console.dir(err);
            }
            res.end(html);
        })
    })
}


// 댓글 달기 //
var addComment = function (req, res) {
    var moment = require('moment');
    console.log('addcomment 호출');
    var time = moment().format('YYYY-MM-DD HH:mm:ss');
    var update = moment().format('YYYY-MM-DD HH:mm');
    var database = req.app.get('database');
    var comm = req.body.comm;
    var id = req.body.id;
    var email = req.user.email;
    database.PostModel.find({ '_id': id }, function (err, result) {
        if (result) {
            // 댓글 내용 추가 //
            result[0].comments.unshift({
                writer: email,
                contents: comm,
                created_at: time,
                updated_at: update
            });
            // 댓글 내용 저장 save를 호출해야 바뀐 내용이 저장됨.//
            result[0].save(function (err) {
                console.log('댓글저장됨');
                if (err) {
                    console.log('댓글 저장중 에러발생');
                }
                res.send(result);
            });
        }
    })
}
// 댓글 삭제하기 //
var removeComment = function (req, res) {
    console.log('removeComment 호출');
    var id = req.query.curid;
    var commentId = req.query.commentId;
    console.log(commentId);
    var database = req.app.get('database');
    database.PostModel.find({ '_id': id }, function (err, result) {
        result[0].comments.splice(commentId, 1);
        console.log('코멘트호출');
        console.log(result[0].comments);
        result[0].save(function (err) {
            if (err) {
                console.log('댓글 삭제 저장중 에러발생');
            }
            res.redirect('/read/?read=' + result[0]._id);
        });

    })
}
// 댓글 수정하기 //
var modifyComment = function (req, res) {
    console.log('modifyComment 호출');
    var moment = require('moment');
    var update = moment().format('YYYY-MM-DD HH:mm');
    var id = req.body.curholic;
    var commentId = req.body.commentId;
    console.log(commentId);
    console.log(id);
    var modifycontent = req.body.modifycontent;
    var database = req.app.get('database');
    database.PostModel.find({ '_id': id }, function (err, result) {
        result[0].comments[commentId].contents = modifycontent;
        result[0].comments[commentId].updated_at = update;
        result[0].save(function (err) {
            if (err) {
                console.log('댓글 수정 저장중 에러발생');
            }
            res.redirect('/read/?read=' + result[0]._id);
        });

    })
}
// 답글 달기 //
var replyComment = function (req, res) {
    console.log('replyComment 호출');
    var moment = require('moment');
    var update = moment().format('YYYY-MM-DD HH:mm');
    var id = req.body.curholic;
    var commentId = req.body.commentId;
    var replyComment = req.body.replycontent;
    var database = req.app.get('database');
    console.log(id);
    console.log(commentId);
    console.log(replyComment);
    database.PostModel.find({ '_id': id }, function (err, result) {
        console.log(result[0].comments[commentId]);

        result[0].comments[commentId].reply.unshift({
            writer: req.user.email,
            contents: replyComment,
            created_at: update,
        })

        result[0].save(function (err) {
            if (err) {
                console.log('댓글 저장중 에러발생');
            }
            res.send(result[0].comments[commentId]);

        });

    })

}
// 댓글순 //
var commentorder = function (req, res) {
    console.log('commentorder 호출');
    var database = req.app.get('database')
    var id = req.body.id;
    database.PostModel.find({ '_id': id }, function (err, result) {
        result[0].comments.sort(function (a, b) {
            return b.reply.length - a.reply.length;
        })
        result[0].save(function (err) {
            if (err) {
                console.dir(err);
            }
            res.send(result);
        })
    })
}
// 최신순 //
var thelatest = function (req, res) {
    console.log('thelatest 호출');
    var database = req.app.get('database')
    var id = req.body.id;
    database.PostModel.find({ '_id': id }, function (err, result) {
        result[0].comments.sort(function (a, b) {
            var dateA = new Date(a.created_at);
            console.log(dateA);
            var dateB = new Date(b.created_at);
            return dateB - dateA;
        })
        result[0].save(function (err) {
            if (err) {
                console.dir(err);

            }
            res.send(result);
        })
    })
}
// 길드 추가하기 //
var guildMake = function (req, res) {
    var database = req.app.get('database');
    var email = req.user.email;
    var guildname = req.body.guild_name;
    var guildImage = req.body.uploadimg;
    var coverImage = req.body.uploadimg1;
    var guildExplain = req.body.guild_intro;
    database.UserModel.find({ 'email': email }, function (err, result) {
        database.PostModel.find({ 'email': email }, function (err, post) {
            var guildmodel = new database.GuildModel({
                guildimage: guildImage,
                guildname: guildname,
                guildCoverImage: coverImage,
                maker: email,
                guildExplain: guildExplain,
            });
            guildmodel.save(function (err) {
                if (err) {
                    console.log(err);
                }
            })
            result[0].guildinfo.push({
                guildimage: guildImage,
                guildname: guildname,
                guildCoverImage: coverImage,
                maker: email,
                guildmaketime: Date.now(),
                guildExplain: guildExplain
            })
            result[0].save(function (err) {
                if (err) {
                    console.log('에러발생');
                    console.dir(err);
                };
                res.redirect('/guildtalk/main');
            })
        })

    })
}

// 이메일로 비밀번호 찾기 //

var email = function (req, res) {
    var email = req.body.email;
    var cord = req.body.random;
    var transporter = nodemailer.createTransport({
        service: 'naver',
        auth: {
            user: 'guildtalk@naver.com',
            pass: 'duadksk9!!'
        }
    })
    var mailOptions = {
        from: '"길드톡"guildtalk@naver.com',
        to: email,
        subject: '길드톡 임시 비밀번호입니다.',
        html: '<body style="margin: 0;padding: 0;"><table style="width:700px; margin: 0 auto; border-spacing: 0px 40px;" cellpadding="0"><tr><td><img src="http://duatpwnd.herokuapp.com/yo/images/email_logo.png" style="vertical-align: middle" alt="팡스카이" title="팡스카이"></td></tr><tr style="border:5px solid red"><td style="font-size:26px;">비밀번호: ' + cord + ' </td></tr></table></body>'
    };
    transporter.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            res.send({result:500,message:'유효하지 않은 형식의 이메일 주소입니다.'});
        } else {
            res.send({result:200,message:response.accepted});
            console.log("Message sent : " + response.accepted);
        }
        transporter.close();
    });
}
module.exports.addpost = addpost;
module.exports.listPost = listPost;
module.exports.addComment = addComment;
module.exports.removeComment = removeComment;
module.exports.modifyComment = modifyComment;
module.exports.replyComment = replyComment;
module.exports.guildMake = guildMake;
module.exports.email = email;
module.exports.commentorder = commentorder;
module.exports.thelatest = thelatest;