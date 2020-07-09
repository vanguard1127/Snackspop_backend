var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/aboutus', function(req, res, next) {
    res.sendfile(path.join(__dirname + '/../public/AboutUs.html'));
});

module.exports = router;
