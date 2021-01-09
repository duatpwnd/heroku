var fs = require('fs');
module.exports = function (router, passport) {

    // intro //
    router.route('/:id').get(function (req, res) {
        const id = req.params.id;

        if (id == 'favicon.ico' || id == 'socket.io') {
            return;
        } else {
            console.log(id);
            res.render(id + '.ejs');
        }
    })
    // 채팅방 //
    router.route('/guildtalk/chat').get(function (req, res) {
        if (req.user) {
            const userinfo = {
                userinfo:req.user
            };
            req.app.render('chat.ejs',userinfo, function (err, html) {
                if (err) {
                    console.log(err);
                }
                res.send(html);
            })
        } else {
            res.redirect('/guildtalk/emailLogin');
        }

    })
    // 길드톡 이메일로 가입하기 :: S //
    router.route('/guildtalk/join').get(function (req, res) {
        res.render('email_join.ejs', { message: req.flash('signupMessage') });
    });
    router.route('/guildtalk/join').post(passport.authenticate('local-signup', {
        successRedirect: '/guildtalk/emailLogin',
        failureRedirect: '/guildtalk/join',
        failureFlash: true
    }));
    // 길드톡 이메일로 가입하기 :: E //

    // 세션이 저장되어있으면 바로 main 페이지로 가기:: S//
    router.route('/email').get(function (req, res) {
        if (req.user) {
            res.redirect('/guildtalk/main');

        } else {
            res.redirect('/guildtalk/emailLogin');
        }
    })

    router.route('/multiLogin').get(function (req, res, next) {
        if (req.user) {
            res.redirect('/guildtalk/main');
        } else {
            res.render('multiLogin.ejs');
        }
    })
    // 세션이 저장되어있으면 바로 main 페이지로 가기:: E//

    // 길드톡 로그인 페이지 :: S //
    router.route('/guildtalk/emailLogin').get(function (req, res) {

        if (req.user) {
            res.redirect('/guildtalk/main');

        } else {
            res.render('email_login.ejs', { message: req.flash('loginMessage') });
        }

    })
    router.route('/guildtalk/emailLogin').post(passport.authenticate('guildtalkLogin', {
        successRedirect: '/guildtalk/main',
        failureRedirect: '/guildtalk/emailLogin',
        failureFlash: true
    }))
    // 길드톡 로그인 페이지 :: E //

    // 로그아웃하기 :: S //
    router.route('/guildtalk/logout').get(function (req, res) {
        if (req.user) {
            console.log('로그아웃 되었습니다.');
            // 구글 로그아웃하며려면 .. 이링크 따라가야함 //
            // location.href = 'https:accounts.google.com/logout';
            req.logout();
            res.redirect('/multiLogin');

        } else {
            console.log('로그인이 되어있지 않습니다.');
            res.redirect('/multiLogin');
        }
    })
    // 로그아웃하기 :: E //


    // 글쓰기 :: S //
    router.route('/guildtalk/write').get(function (req, res) {
        console.log('write호출');
        var database = req.app.get('database');
        var guildname = req.query.guildname;
        var guildid = req.query.guildid;
        var context = {
            modify: req.query.modify,
            userSession: req.user,
            guildname: guildname,
            guildid: guildid
        }
        req.app.render('write', context, function (err, html) {
            if (err) {
                console.log(err);
            }
            res.send(html);
        })
    })
    // 글쓰기 :: E //

    // 글수정 페이지 들어가기 :: S //
    router.route('/write/modify').get(function (req, res) {
        console.log('/write/modify호출');
        var database = req.app.get('database');
        var curn = req.query.curn;
        console.log(curn);
        database.PostModel.find({ '_id': req.query.modify }, function (err, result) {
            var context = {
                modify: result,
                userSession: req.user,
                curn: curn
            }
            req.app.render('modify', context, function (err, html) {
                if (err) {
                    console.log(err);
                }
                res.send(html);
            })
        })

    })
    // 글수정 페이지 들어가기 :: E //


    // 글수정 완료 :: S //
    router.route('/modify/success').post(function (req, res) {
        console.log('/modify/success 호출');
        var modifytitle = req.body.title;
        var modifycontent = req.body.contents;
        var modifyid = req.body.objectid;
        var database = req.app.get('database');
        database.PostModel.find({ '_id': modifyid }, function (err, result) {
            result[0].title = modifytitle;
            result[0].contents = modifycontent;
            result[0].save(function (err) {
                console.log('글수정완료');
            })
            console.log(result);
            res.redirect('/read/?read=' + modifyid + '')
        })
    })
    // 글수정 완료 :: E //

    // 길드만들기 :: S //
    router.route('/guildtalk/guildmake').get(function (req, res) {

        var context = {
            userSession: req.user,
            add: req.query.add
        }
        req.app.render('guild_make', context, function (err, html) {
            if (err) {
                console.log(err);
            }
            res.send(html);
        })
    });
    // 길드만들기 :: E // 

    // 길드만들기 > 게임선택하기 :: S //
    router.route('/gameChoice').get(function (req, res) {
        res.render('game_search');
    })
    // 길드만들기 > 게임선택하기 :: E //

    // 메인페이지 :: S //
    router.route('/guildtalk/main').get(function (req, res) {
        var database = req.app.get('database');
        if (req.user) {
            database.GuildModel.find({ 'maker': req.user.email }).exec(function (err, result) {
                // 공지사항 && 자유게시판 && 공략게시판 나누기위해 //
                database.PostModel.find({ 'owner': req.user.email }).exec(function (err, write) {
                    write.sort(function (a, b) {
                        var postA = new Date(a.created_at);
                        var postB = new Date(b.created_at);
                        return postB - postA;
                    })
                    var context = {
                        result: req.user,
                        posts: result,
                        write: write
                    }
                    req.app.render('main', context, function (err, html) {
                        if (err) {
                            console.dir(err);
                        }
                        res.send(html);
                    });
                })
            });
        } else {
            res.redirect('/multiLogin');
        }

    });
    // 메인페이지 :: E //


    // 내길드 들어가기 :: S //

    router.route('/guildtalk/guildmaster').get(function (req, res) {
        console.log('/guildtalk/guildmaster 호출');
        var database = req.app.get('database');
        var guildname = req.query.guildname;
        var options = {
            page: req.query.page - 1,
            perPage: 5
        }
        if (req.query.page == 1) {
            options.page = 0;
        }
        database.PostModel.find({ 'guildType': guildname }).populate('writer').sort({ 'created_at': -1 }).limit(Number(options.perPage)).skip(options.perPage * options.page)
            .exec(function (err, result) {
                if (err) {
                    console.dir(err);
                    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf8;' })
                    res.write('<h1>게시판 글 목록 조회중 오류발생</h1>');
                    res.end();
                }
                database.PostModel.find({ 'guildType': guildname }).countDocuments(function (err, count) {
                    if (err) {
                        console.dir(err);
                    }
                    database.GuildModel.find({ 'guildname': guildname }, function (err, guild) {
                        var context = {
                            posts: result,
                            page: Number(req.query.page),
                            curn: req.query.curn,
                            initial: Math.floor((Number(req.query.page) - 1) / 5) * 5 + 1,
                            pageCount: Math.ceil(count / 5) + 1, // 6
                            perPage: options.perPage,
                            email: req.user.email,
                            guild: guild,
                        };
                        console.log(Math.ceil(count / 5) + 1);
                        req.app.render('guild_master', context, function (err, html) {
                            if (err) {
                                console.dir(err);
                            }
                            res.end(html);
                        })
                    })
                })
            })
    })
    // 내길드 들어가기 :: E //

    // 내길드 더보기 :: S //
    router.route('/more/view').get(function (req, res) {
        var database = req.app.get('database');
        database.UserModel.find({ 'email': req.user.email }, function (err, result) {
            console.log(result);
            if (err) {
                console.log('에러발생');
                console.dir(err);
            }
            var context = {
                list: result[0].guildinfo
            }
            req.app.render('mygame_search', context, function (err, html) {
                res.send(html);
            })
        })

    })
    // 내길드 더보기 :: E //


    // 게임검색하기 :: S  //
    router.route('/game_search').get(function (req, res) {
        var database = req.app.get('database');
        database.UserModel.find({}, function (err, result) {
            database.GuildModel.find({}, function (err, guild) {
                res.render('game_search', { result: result, guild: guild }, function (err, html) {
                    if (err) {
                        console.dir(err);
                    }
                    res.end(html);
                })
            })

        })

    })
    // 게임검색하기 :: E  //


    // facebook으로 로그인 하기 :: S //
    // 페이스북 로그인 //
    router.route('/guildtalk/facebook').get(passport.authenticate('facebook'))
    // 페이스북 로그인 결과//
    router.route('/auth/facebook/callback').get(passport.authenticate('facebook', {
        successRedirect: '/guildtalk/main',
        failureRedirect: '/'
    }));

    // facebook으로 로그인 하기 :: E //

    // google로 로그인 하기 :: S //
    router.route('/guildtalk/google').get(passport.authenticate('google', {
        scope: ['profile', 'email']

    }));
    router.route('/auth/google/callback').get(passport.authenticate('google', {
        successRedirect: '/guildtalk/main',
        failureRedirect: '/multiLogin'

    }))
    // google로 로그인 하기 :: E //

    // naver로 로그인 :: S //
    router.route('/guildtalk/naver').get(passport.authenticate('naver'));
    router.route('/auth/naver/callback').get(passport.authenticate('naver', {
        successRedirect: '/guildtalk/main',
        failureRedirect: '/multiLogin'
    }))
    // naver로 로그인 :: E //
}


