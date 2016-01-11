var express = require('express');
var router = express.Router();
var gdrv = require('../lib/googledrvapi');

/* GET home page. */
router.get('/', function (req, res, next) {

  var items = null;

  gdrv.init()
      .then(function () {
        return gdrv.readFile(gdrv.TokenPath);
      })
      .then(function (token) {
            return gdrv.authorize(token);
          },
          function (err) {
            var authUrl = gdrv.getTokenUrl('http://localhost:3000/oauth2callback');
            res.redirect(authUrl);
            throw err;
          })
      .then(function () {
        return gdrv.listFiles()
            .then(function(items){
              res.render('index', {title: 'Google auth', items: items});
            });
      })
      .catch(function(err){
        res.render('index', {title: 'Google auth', err: err});
      });


});

module.exports = router;
