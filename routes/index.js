var express = require('express');
var router = express.Router();
var gdrv = require('../lib/googledrvapi');

/* GET home page. */
router.get('/', function(req, res, next) {

  var items = null;

  gdrv.init().then(function(){
    gdrv.readFile(gdrv.TokenPath).then(
        function(token){
          gdrv.authorize(token);
          items = gdrv.listFiles();
        },
        function(err){
          var authUrl = gdrv.getTokenUrl('http://localhost:3000/oauth2callback');
          return res.redirect(authUrl);
        }
    );
  });

  res.render('index', { title: 'Express', items: items });
});

module.exports = router;
