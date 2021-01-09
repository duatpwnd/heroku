const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cookieParser = require("cookie-parser");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcrypt-nodejs");
// mysql 연동 정보 //
//createConnection 보다 createPool을 권장  //
// const pool = mysql.createPool({
//     connectionLimit:10,
//     host: 'us-cdbr-iron-east-02.cleardb.net'
//     user: 'b12df9b15b107f',
//     password: '51cc57ea',
//     database: 'heroku_c26215ce5de8cfe'
// });
// localhost
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "duadksk9!!",
  database: "test"
});
pool.getConnection(function (err, conn) {
  if (err) {
    console.log(err);
    if (conn) {
      conn.release();
    }
  }
});
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public/yo"));
app.use(cookieParser());
app.use("/", router);
// 검색 //
// myisam 과 innodb 의 차이점 //
// innodb는 3글자부터 검색 인식하고 myisam은 네글자부터 검색을 인식함 //
// ft_min_word_len 으로 설정 my.ini파일에 수정후 컴퓨터를 다시껐다 켜야지 바껴있음 ..
// myisam이 전문검색에서 유리함 hedisql 옵션에 여러가지 엔진이있음  삽질 ..//
// fulltext 인덱스 절대추가하지말것 .//

// 로그인페이지//
router.route("/login").get(function (req, res) {
  res.render("login.ejs");
});
router.route("/login").post(function (req, res) {
  pool.query("SELECT * FROM test WHERE userid = ?", [req.body.userid], function (
    error,
    results,
    fields
  ) {
    console.log(results);
    console.log(results.length);
    if (error) {
      console.log(error);
    }
    if (results.length > 0) {
      bcrypt.compare(req.body.userpw, results[0].userpw, function (err, success) {
        console.log(success);
        if (success) {
          res.send("성공적인응답입니다.");
        } else {
          res.send(success);
        }
      });
    } else {
      res.send(results)
    }
  });
});
app.get("/join", function (req, res) {
  res.render("testjoin.ejs");
});
// 글조회 //
app.get("/board", function (req, res) {
  console.log("/board호출");
  console.log("$$$$$$$$$$$");
  if (req.query.page == "") {
    req.app.render("error.ejs", function (err, html) {
      if (err) {
        console.log(err);
      } else {
        res.send(html);
      }
    });
  } else {
    let page = (Number(req.query.page) - 1) * 5;
    pool.query("select*from test ORDER BY number DESC;", function (
      err,
      result1
    ) {
      const count = 5;
      const paging = Math.ceil(result1.length / count);
      const initial = Number(req.query.page);
      pool.query(
        "select*from test order by number desc limit " + page + ",5",
        function (err, result) {
          console.log(err);
          console.log(result);
          const context = {
            board: "board",
            keyword: "all",
            initial: initial,
            post: result,
            paging: paging,
            pageNumber: Number(req.query.page)
          };
          req.app.render("test.ejs", context, function (err, html) {
            if (err) {
              console.log(err);
              req.app.render("error.ejs", function (err, html) {
                if (err) {
                  console.log(err);
                } else {
                  res.send(html);
                }
              });
            } else {
              res.send(html);
            }
          });
        }
      );
    });
  }
});
app.get("/test/list", function (req, res) {
  console.log("/test/list호출");
  let page = (Number(req.query.page) - 1) * 5;
  pool.query("select*from test ORDER BY number DESC;", function (err, result1) {
    const count = 5;
    const paging = Math.ceil(result1.length / count);
    const initial = Number(req.query.page);
    pool.query(
      "select*from test order by number desc limit " + page + ",5",
      function (err, result) {
        if (err) {
          console.log(err);
        }
        console.log(result);
        for (let s = 0; s < result.length; s++) {
          result[s].board = "board";
          result[s].initial = initial;
          result[s].paging = paging;
          result[s].keyword = "all";
          result[s].pageNumber = Number(req.query.page);
        }
        res.send(result);
      }
    );
  });
});
app.post("/test/search", function (req, res) {
  console.log("/test/search 호출");
  const parse = JSON.parse(req.body.data);
  const searchResult = parse.search;
  console.log(searchResult);
  if (req.query.page < 1) {
    req.query.page = 1;
  }
  let page = (Number(req.query.page) - 1) * 5;
  // 해당단어를 포함하고 검색어수 제한
  pool.query(
    'SELECT * FROM test  WHERE match(title) against("' +
    searchResult +
    '*" in boolean mode)',
    function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      console.log("%%%%%%%%%%%%%%%%%%");
      console.log(results);
      const count = 5;
      const paging = Math.ceil(results.length / count);
      const initial = Number(req.query.page);
      pool.query(
        'select * from test where match(title) against("' +
        searchResult +
        '* " in boolean mode) order by number desc limit ' +
        page +
        ",5",
        function (err, result) {
          console.log("/////////////////////////");
          for (let s = 0; s < result.length; s++) {
            result[s].initial = initial;
            result[s].paging = paging;
            result[s].keyword = searchResult;
          }
          console.log(result);
          res.status(200).send(result);
        }
      );
    }
  );
});
app.get("/test/search", function (req, res) {
  console.log("/test/search get 호출");
  console.log(req.query.page);
  console.log(req.query.keyword);
  if (req.query.page < 1) {
    req.query.page = 1;
  }
  let page = (Number(req.query.page) - 1) * 5;
  // 해당단어를 포함하고 검색어수 제한
  pool.query(
    'SELECT * FROM test  WHERE match(title) against("' +
    req.query.keyword +
    '*" in boolean mode)',
    function (error, results, fields) {
      console.log("^^^^^^^^^^^^^^^^");
      console.log(results);
      const count = 5;
      const paging = Math.ceil(results.length / count);
      const initial = Number(req.query.page);
      pool.query(
        'select * from test where match(title) against("' +
        req.query.keyword +
        '*" in boolean mode) order by number desc limit ' +
        page +
        ",5",
        function (err, result) {
          console.log("/////////////////////////");
          console.log(result);
          const context = {
            board: "test/search",
            keyword: req.query.keyword,
            initial: initial,
            post: result,
            paging: paging,
            pageNumber: Number(req.query.page)
          };
          req.app.render("test.ejs", context, function (err, html) {
            res.send(html);
          });
        }
      );
    }
  );
});
// 글작성 //
app.post("/test/add", function (req, res) {
  console.log(req.body);
  console.log("/test/add 호출");
  pool.query("INSERT INTO test set ?", req.body, function (err, result) {
    console.log(result);
    res.send(result);

    if (err) {
      console.error(err);
      throw err;
    }
  });
});

// 글읽기 //
app.get("/read", function (req, res) {
  console.log("/read 호출");
  console.log(req.query.page);
  pool.query("select * from test where number = ?", [req.query.page], function (
    error,
    result
  ) {
    console.log(result);
    req.app.render("contents.ejs", { result: result }, function (err, html) {
      res.send(html);
    });
  });
});

// 글수정//
app.post("/modify", function (req, res) {
  const parse = req.body;
  console.log(parse.title);
  console.log(parse.contents);
  pool.query(
    "update test set title=?,contents=? where number = ?",
    [parse.title, parse.contents, parse.number],
    function (err, result) {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        res.send(result);
      }
    }
  );
});
// 회원가입 //
router.route("/register").post(function (req, res) {
  console.log("register 호출");
  bcrypt.hash(req.body.userpw, null, null, function (err, hash) {
    console.log("해쉬");
    console.log(hash);
    var sql = {
      userid: req.body.userid,
      userpw: hash,
      usertel: req.body.usertel,
      username: req.body.username
    }; // 입력받은 평문을 hash로 바꿔서 넣어준다
    pool.query("insert into test set ?", sql, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        res.send("성공200");
      }
    });
  });
});
// 아이디 중복확인 //
router.route("/repeat").post(function (req, res) {
  console.log("/repeat 호출");
  pool.query("select * from test where userid = ?", [req.body.userid], function (
    err,
    result
  ) {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
      res.send(result);
    }
  });
});
app.post("/test/list", function (req, res) {
  pool.query("SELECT * FROM test WHERE id = ?", [req.body.paramid], function (
    error,
    results,
    fields
  ) {
    console.log(results);
    if (error) {
      console.log(error);
    }
    if (results.length > 0) {
      bcrypt.compare(req.body.parampw, results[0].password, function (err, res) {
        if (res) {
          res.send("성공적인응답입니다.");
        }
      });
    }
  });
});
// 글삭제 //
app.delete("/test/delete", function (req, res) {
  console.log("delete호출");
  const parse = JSON.parse(req.body.data);
  console.log(parse);
  const deleteList = parse.join(",");
  pool.query("DELETE FROM test WHERE number in (" + deleteList + ")", function (
    err,
    result
  ) {
    if (err) {
      console.log(err);
    }
    res.send(result);
  });
});
app.post("/test/update", function (req, res) {
  console.log(req.body.modify);
  pool.query(
    "UPDATE test SET id=? WHERE index=?",
    [req.body.modify, 1],
    function (err, result) {
      if (err) {
        console.log(err);
      }
      console.log(result);
    }
  );
});
app.use((req, res, next) => {
  // 404 처리 부분
  req.app.render("error.ejs", function (err, html) {
    if (err) {
      console.log(err);
    } else {
      res.send(html);
    }
  });
});
app.listen(process.env.PORT || 3000, function () {
  console.log("mysql 서버 실행");
});
