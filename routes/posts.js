var express = require('express');
var router = express.Router();
var {getConnection} = require('./connect.js');
var oracledb = require('oracledb');

/* 게시판 */
router.get('/', function(req, res, next) {
  res.render('index', { title: '게시판', pageName:'posts/list.ejs' }); // 인덱스 파일 랜더링
});

// 게시글 목록 데이터 출력 API
router.get('/list.json', async function(req, res) {
  let page = parseInt(req.query.page) || 1;
  let size = parseInt(req.query.size) || 5;
  let word = req.query.word || '';
  let off_rows = (page - 1) * size;
  let con;
  
  try {
    con = await getConnection();
    
    // 1. 공백 오타 수정: 각 쿼리 시작과 끝에 명확하게 공백(" ")을 추가하여 결합 오류 차단
    let sql = "select * from view_posts "; 
        sql += `where TITLE LIKE '%${word}%' OR CONTENT LIKE '%${word}%' OR sname LIKE '%${word}%' `
        sql += "order by id desc ";
        sql += `offset ${off_rows} rows fetch next ${size} rows only`;
        
    let result = await con.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    let list = result.rows;

    // 2. count 쿼리에도 확실한 공백 지정 및 포맷팅 통일
    sql = "select count(*) as cnt from view_posts ";
    sql += `where TITLE LIKE '%${word}%' OR CONTENT LIKE '%${word}%' OR sname LIKE '%${word}%'`;
    
    // 목록 조회와 형식을 맞춰 OBJECT 형태로 리턴 받습니다.
    result = await con.execute(sql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    let count = result.rows[0].CNT; // 대문자 별칭 객체(.CNT)로 정확히 파싱

    res.send({ list, count });
  }
  catch(err) {
    console.log('게시글 목록 불러오기 오류', err.message);
    // 에러 발생 시 프론트엔드가 무한 대기에 빠지지 않도록 에러 상태 전송
    res.status(500).send({ error: err.message });
  }
  finally {
    if(con) await con.close();
  }
});

// 글쓰기 페이지 이동
router.get('/insert', function(req, res) {
  res.render('index', { title: '글쓰기', pageName: 'posts/insert.ejs' });
});

module.exports = router;