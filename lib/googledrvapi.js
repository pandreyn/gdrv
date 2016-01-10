/**
 * Created by apetkevich on 30.12.2015.
 */

var fs = require('fs');
var os = require('os');
var Promise = require('promise');
var readline = require('readline');

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
      readFile(SECRET_PATH).then(function (secret) {
        return that.createAuth(JSON.parse(secret));
      }, function (err) {
        console.log(err);
      }).then(function (auth) {
        oauth = auth;
        resolve();
      })
    });
  },
  createAuth: function (secret) {

    //console.log('secret = ', secret);

    return new Promise(function (resolve, reject) {

      try {
        var clientSecret = secret.installed.client_secret;
        var clientId = secret.installed.client_id;
        var redirectUrl = secret.installed.redirect_uris[1];
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
      access_type: 'offline',
      //access_type: 'online',
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
      service.files.list({
        auth: this.auth,
        maxResults: 10
      }, function (err, response) {
        if (err) {
          reject(err);
        }
        resolve(response.items);
      });
    });
  }
};


//var gdrv = {
//
//
//  readFile: function (fileName) {
//    return new Promise(function (resolve, reject) {
//      fs.readFile(fileName, function (err, content) {
//        if (err) {
//          reject(err);
//        } else {
//          resolve(content);
//        }
//      });
//
//    })
//  },
//
//
//// Load client secrets from a local file.
//  connect: function () {
//    var that = this;
//
//    readFile(SECRET_PATH).then(function (content) {
//      that.authorize(JSON.parse(content), that.listFiles);
//    }, function (err) {
//      throw err;
//    });
//  },
//
//  /**
//   * Create an OAuth2 client with the given credentials, and then execute the
//   * given callback function.
//   *
//   * @param {Object} credentials The authorization client credentials.
//   * @param {function} callback The callback to call with the authorized client.
//   */
//  authorize: function (credentials, callback) {
//    var that = this;
//    var clientSecret = credentials.installed.client_secret;
//    var clientId = credentials.installed.client_id;
//    var redirectUrl = credentials.installed.redirect_uris[0];
//    var auth = new googleAuth();
//    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
//
//    // Check if we have previously stored a token.
//    fs.readFile(TOKEN_PATH, function (err, token) {
//      if (err) {
//        var authUrl = that.getNewToken(oauth2Client, callback);
//      } else {
//        oauth2Client.credentials = JSON.parse(token);
//        callback(oauth2Client);
//      }
//    });
//  },
//
//  /**
//   * Get and store new token after prompting for user authorization, and then
//   * execute the given callback with the authorized OAuth2 client.
//   *
//   * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
//   * @param {getEventsCallback} callback The callback to call with the authorized
//   *     client.
//   */
//  getNewToken: function (oauth2Client, callback) {
//    return oauth2Client.generateAuthUrl({
//      access_type: 'offline',
//      scope: SCOPES,
//      redirect_uri: 'http://localhost:3000/oauth2callback'
//    });
//    //console.log('Authorize this app by visiting this url: ', authUrl);
//    //var rl = readline.createInterface({
//    //  input: process.stdin,
//    //  output: process.stdout
//    //});
//    //rl.question('Enter the code from that page here: ', function (code) {
//    //  rl.close();
//    //  oauth2Client.getToken(code, function (err, token) {
//    //    if (err) {
//    //      console.log('Error while trying to retrieve access token', err);
//    //      return;
//    //    }
//    //    oauth2Client.credentials = token;
//    //    storeToken(token);
//    //    callback(oauth2Client);
//    //  });
//    //});
//  },
//
//  /**
//   * Store token to disk be used in later program executions.
//   *
//   * @param {Object} token The token to store to disk.
//   */
//  storeToken: function (token) {
//    try {
//      fs.mkdirSync(TOKEN_DIR);
//    } catch (err) {
//      if (err.code != 'EEXIST') {
//        throw err;
//      }
//    }
//    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
//    console.log('Token stored to ' + TOKEN_PATH);
//  },
//
//  /**
//   * Lists the names and IDs of up to 10 files.
//   *
//   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//   */
//  listFiles: function (auth) {
//    var service = google.drive('v2');
//    service.files.list({
//      auth: auth,
//      maxResults: 10
//    }, function (err, response) {
//      if (err) {
//        console.log('The API returned an error: ' + err);
//        return;
//      }
//      var files = response.items;
//      if (files.length == 0) {
//        console.log('No files found.');
//      } else {
//        console.log('Files:');
//        for (var i = 0; i < files.length; i++) {
//          var file = files[i];
//          //console.log('%s (%s)', file.title, file.id);
//          console.log(file);
//        }
//      }
//    });
//  }
//
//};

module.exports = new GoogleDrive();