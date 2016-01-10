var express = require('express');
var router = express.Router();
var url = require('url');
var gdrv = require('../lib/googledrvapi');


/* GET home page. */
router.get('/', function(req, res, next) {

  var items = null;
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;

  //console.log('query = ', query);

  if (query && query.code) {
    gdrv.saveToken(query.code).then(
        function(token){
          gdrv.storeToken(token);
          gdrv.authorize(token);
          items = gdrv.listFiles();

          var locals = { title: 'Express', items: items  };
          res.render('index', locals);
        }, function (err){
          var locals = { title: 'Express', err: err  };
          res.render('index', locals);
        }
    );
  }


});

module.exports = router;
