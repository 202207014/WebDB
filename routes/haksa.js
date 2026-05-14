//haksa.js
var express = require('express');
var router = express.Router();
var {getConnection} = require('./connect.js');
var oracledb = require('oracledb');
/* manage professors page */
router.get('/pro', function(req, res, next) {
  res.render('index',{title:'교수관리',pageName:'haksa/professors.ejs'});
});

/*Generate Data of professors*/
router.get('/pro/list.json',async function(req,res){
    var con;
    try{
        con = await getConnection();
        let sql="select p.*, to_char(hiredate,'YYYY-MM-DD')fdate, to_char(salary,'999,999,999')fsalary from professors p";
        sql += " order by pcode"
        const result = await con.execute(sql,{},{outFormat:oracledb.OUT_FORMAT_OBJECT});
        res.send(result.rows);
    }
    catch(err){

    }
    finally{
        if(con) await con.close();
    }
})
/*insert professors page*/
router.get('/pro/insert',async function(req,res)
{
  let code;
  let con;
  try{
    con = await getConnection();
    const sql = "select max(pcode)+1 from professors";
    const result = await con.execute(sql);
    code = result.rows[0][0];
  }
  catch(err){

  }
  finally
  {
    if(con) await con.close();
  }
  res.render('index.ejs',{title:'교수등록',pageName:'haksa/professors_insert.ejs', code})
});
//insert professors
router.post('/pro/insert', async function(req,res){
  const pcode = req.body.pcode;
  const pname = req.body.pname;
  const dept = req.body.dept;
  const title = req.body.title;
  const hiredate = req.body.hiredate;
  const salary = req.body.salary;
  console.log(pcode,pname,dept,title,hiredate,salary);
  let con;
  try{
    con = await getConnection();
    let sql ="insert into professors(pcode,pname,dept,title,hiredate,salary)";
    sql += "values(:pcode,:pname,:dept,:title,:hiredate,:salary)";
    await con.execute(sql,{pcode,pname,dept,title,hiredate,salary},{autoCommit:true});
  }catch(err){

  }finally{
    await con.close();
  }
  res.sendStatus(200);
});
//delete professors REST API
router.post('/pro/delete', async function(req,res){
  const pcode = req.body.pcode;
  console.log(pcode);
  let con;
  try{
    con = await getConnection();
    let sql = "delete from professors where pcode = :pcode";
    await con.execute(sql,{pcode},{autoCommit:true});
    res.sendStatus(200);
  }catch(err){
    res.sendStatus(500);
  }finally{
    if(con) await con.close();
  }
});
/* manage students page */
router.get('/stu', function(req, res, next) {
  res.render('index',{title:'학생관리',pageName:'haksa/students.ejs'});
});


router.get('/stu/list.json', async function (req, res) {
    let con;
    try {
        con = await getConnection();
        const sql="select * from view_students";
        const result = await con.execute(sql, {}, {outFormat:oracledb.OUT_FORMAT_OBJECT});
        res.send(result.rows);
    } catch (err) {

    } finally {
        if(con) await con.close();
    }
});
//학생 등록페이지
router.get('/stu/insert', async function(req, res){
    let con;
    let code;
    try{
        const con = await getConnection();
        const sql="select max(scode)+1 from students";
        const result = await con.execute(sql);
        code = result.rows[0][0];
        console.log(code);
    }catch(err){
        console.log(err);
    }finally{
        if(con) con.close();
    }
    res.render('index', {title: '학생입력', pageName:'haksa/students_insert.ejs', code});
});
//학생 등록
router.post('/stu/insert', async function(req,res){
  const scode = req.body.scode;
  const sname = req.body.sname;
  const dept = req.body.dept;
  const birthday = req.body.birthday;
  const year = req.body.year;
  const advisor = req.body.pcode;
  let con;
  try{
    con = await getConnection();
    let sql ="insert into students(scode,sname,dept,birthday,year,advisor)";
    sql += "values(:scode,:sname,:dept,:birthday,:year,:advisor)";
    await con.execute(sql,{scode,sname,dept,birthday,year,advisor},{autoCommit:true});
     res.sendStatus(200);
  }catch(err){
    res.sendStatus(500);
    // console.log(err);
  }finally{
    if(con)await con.close();
  }
 
});
//학생삭제
router.post('/stu/delete', async function(req,res){
  const scode = req.body.scode;
  let con;
  try{
    con = await getConnection();
    let sql = "delete from students where scode=:scode";
    await con.execute(sql, {scode},{autoCommit:true});
    res.sendStatus(200);
  }catch(err){
    res.sendStatus(500);
  }
  finally{
    if(con) await con.close();
  }
})
/* manage professors page */
router.get('/cou', function(req, res, next) {
  res.render('index',{title:'강좌관리',pageName:'haksa/courses.ejs'});
});

module.exports = router;
