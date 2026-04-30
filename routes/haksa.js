var express = require('express');
var router = express.Router();
var {getConnection} = require('./connect.js');
var oracledb = require('oracledb');
/* manage professors page */
router.get('/pro', function(req, res, next) {
  res.render('index',{title:'교수관리',pageName:'haksa/professors.ejs'});
});
/*Generate Data of professors*/
router.get('pro/list.json',async function(req,res){
    var con;
    try{
        con = await getConnection();
        const sql="select * from professors";
        const result = await con.execute(sql,{},{outFormat:oracledb.OUT_FORMAT_OBJECT});
        res.send(result.rows);
    }
    catch(err){

    }
    finally{
        if(con) await con.close();
    }
})
/* manage students page */
router.get('/stu', function(req, res, next) {
  res.render('index',{title:'학생관리',pageName:'haksa/students.ejs'});
});
/* manage professors page */
router.get('/cou', function(req, res, next) {
  res.render('index',{title:'강좌관리',pageName:'haksa/courses.ejs'});
});

module.exports = router;
