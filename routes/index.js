var express = require('express');
var router = express.Router();
var gdrv = require('../lib/googledrvapi');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Старт!' });
});

module.exports = router;
