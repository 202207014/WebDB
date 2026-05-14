
var express = require('express');
var router = express.Router();

/* 게시판 */
router.get('/', function(req, res, next) {
  res.render('index', { title: '게시판', pageName:'posts/list.ejs' });//인덱스 파일 랜더링
});

module.exports = router;
