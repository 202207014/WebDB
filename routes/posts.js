var express = require('express');
var router = express.Router();
var {getConnection} = require('./connect.js');
var oracledb = require('oracledb');

/* 게시판 */
router.get('/', function(req, res, next) {
  res.render('index', { title: '게시판', pageName:'posts/list.ejs' });//인덱스 파일 랜더링
});

//게시글 목록 데이터 출력 API
router.get('/list.json',async function(req,res){
  let con;
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  const offrows = (page - 1) * size;
  try{
    con = await getConnection();
    let sql = `select * from view_posts order by id desc offset ${offrows} rows fetch next ${size} rows only`;
    let result = await con.execute(sql,{},{outFormat:oracledb.OUT_FORMAT_OBJECT});
    
    const list = result.rows;
    
    sql = "select count(*) from posts";
    result = await con.execute(sql);
    const count = result.rows[0][0];
    //console.log(result.rows);
   
    res.send({list,count});
  }catch(err){
    console.log('게시글 목록 데이터',err.message);
  }finally{
    if(con) await con.close();
  }
});
module.exports = router;
