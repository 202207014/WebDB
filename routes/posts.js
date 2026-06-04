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
//게시글 등록
router.post('/insert',async function(req, res){
  const title = req.body.title;
  const content = req.body.content;
  const writer = req.body.writer;
  // console.log(title, content, writer);
  let con;
  try{
    con = await getConnection();
    let sql = "insert into posts(title, content, writer) values(:title, :content, :writer)";
    await con.execute(sql,{title, content, writer}, {autoCommit : true});
    res.sendStatus(200);
  }catch(err){
    console.log("게시글 등록",err.message);
    res.sendStatus(500);
  }finally{
    if(con) await con.close();
  }
  
});
//게시글 정보페이지
router.get('/:id', async function(req,res){
  const id = req.params.id;
  let con
  try{
    con = await getConnection();
    let sql = "select * from view_posts where id = :id";
    let result = await con.execute(sql, {id}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
    let post = result.rows[0];
    res.render('index',{title:'게시글 정보', pageName:'posts/read.ejs',post});
  }catch(err)
  {
    console.log("게시글 보기 오류",err.message);
    res.sendStatus(500);
  }
  finally{
    if(con) await con.close();
  }
});
//게시글 수정 페이지 불러오기
router.post('/delete',async function(req,res){
  const id = req.body.id;
  let con;
  try{
    con = await getConnection();
    let sql = "delete from posts where id = :id";
    await con.execute(sql,{id},{autoCommit:true});
    res.sendStatus(200);
  }catch(err){
    console.log("게시글 삭제 오류",err.message);
    res.sendStatus(500);
  }finally{
    if(con) await con.close();
  }
})
router.get("/update/:id", async function(req,res){
  const id = req.params.id;
  let con;
  try{
    con = await getConnection();
    sql = "select * from view_posts where id = :id";
    let result = await con.execute(sql,{id},{outFormat:oracledb.OUT_FORMAT_OBJECT});
    let post = result.rows[0];
    res.render('index',{title:"게시글 수정", pageName:'posts/update.ejs',post});
  }catch(err){
    console.log('게시글 수정 페이지', err.message);
    res.sendStatus(500);
  }finally{
    if(con) await con.close();
  }
})
//게시글 수정
router.post('/update',async function(req,res){
  const id = req.body.id;
  const title = req.body.title;
  const content = req.body.content;
  let con;
  try{
    con = await getConnection();
    sql = "update posts set title = :title, content = :content where id = :id";
    await con.execute(sql, {title, content, id},{autoCommit:true});
    res.sendStatus(200);
  }
  catch(err)
  {
    console.log("게시글 수정 오류", err.message);
    res.sendStatus(500);
  }
  finally{
    if(con) await con.close();
  }
});
module.exports = router;