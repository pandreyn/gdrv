var express = require('express');
var router = express.Router();
var url = require('url');
var gdrv = require('../lib/googledrvapi');


/* GET home page. */
router.get('/', function(req, res, next) {

  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;

  console.log('query = ', query);

  res.render('index', { title: 'Express' });
});

module.exports = router;
