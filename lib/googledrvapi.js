/**
 * Created by apetkevich on 30.12.2015.
 */

var fs = require('fs');
var os = require('os');
var Promise = require('promise');

var google = require('googleapis');
var googleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
var TOKEN_DIR = os.homedir() + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';
var SECRET_PATH = 'client_secret.json';

var oauth = null;

function readFile(fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function (err, content) {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });

  })
}


function GoogleDrive() {
  this.TokenPath = TOKEN_PATH;
}

GoogleDrive.prototype = {

  readFile: readFile,

  init: function () {
    var that = this;
    return new Promise(function (resolve, reject) {
      readFile(SECRET_PATH)
          .then(function (secret) {
            return that.createAuth(JSON.parse(secret));
          }, function (err) {
            console.log(err);
          })
          .then(function (auth) {
            oauth = auth;
            resolve();
          })
          .catch(function(err){
            throw err;
          });
    });
  },
  createAuth: function (secret) {

    //console.log('secret = ', secret);

    return new Promise(function (resolve, reject) {

      try {
        var clientSecret = secret.web.client_secret;
        var clientId = secret.web.client_id;
        var redirectUrl = secret.web.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        resolve(oauth2Client);
      } catch (err) {
        reject(err);
      }

    });
  },
  getTokenUrl: function (redirectUrl) {
    var url = redirectUrl || 'http://localhost:3000/oauth2callback';
    var ret = oauth.generateAuthUrl({
      //access_type: 'offline',
      access_type: 'online',
      scope: SCOPES,
      redirect_uri: url
    });

    return ret;
  },
  authorize: function (token) {
    return new Promise(function (resolve, reject) {
      oauth.credentials = JSON.parse(token);
      resolve();
    });
  },
  saveToken: function (code) {
    var that = this;

    return new Promise(function (resolve, reject) {
      oauth.getToken(code, function (err, token) {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });

    });
  },
  storeToken: function (token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  },
  listFiles: function () {
    var service = google.drive('v2');

    return new Promise(function (resolve, reject) {
      //service.files.list({
      service.changes.list({
        auth: oauth,
        maxResults: 100
      }, function (err, response) {
        if (err) {
          reject(err);
          return;
        }
        resolve(response.items);
      });
    });
  }
};


module.exports = new GoogleDrive();