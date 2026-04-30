var express = require('express');
var router = express.Router();

/* HomePage */
router.get('/', function(req, res, next) {
  res.render('index', { title: '홈페이지', pageName:'home.ejs' });//인덱스 파일 랜더링
});

module.exports = router;
