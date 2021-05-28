'use strict'
const CONFIG = require('../../config/config');
var jwt = require('jwt-simple'),
  moment = require('moment'),
  secret = CONFIG.jwt_secret_key;

exports.ensureAuth = function (req, def, scopes, callback) {

  if (!req.headers.authorization) {
    var err = new Error('Authorization failed');
    err.status = "fail";
    err.data = {
      error: 401,
      message: 'Authorization failed: expired JWT'
    }
    err.code = 401;
    return callback(err);
  }
  //regular expression -->  removing " char
  var token = req.headers.authorization.replace(/['"]+/g, '');

  exports.verifyJwt(req, token, callback);
}

exports.verifyJwt = function (req, token, callback) {

  try {
    var payload = jwt.decode(token, secret);
    if (payload.exp <= moment().unix()) {
      var err = new Error('Authorization failed: expired JWT');
      err.status = "fail";
      err.data = {
        error: 401,
        message: 'Authorization failed: expired JWT'
      }
      err.code = 401;
      return callback(err);
    }
  } catch (ex) {
    var err = new Error('Authorization failed: expired JWT - ' + ex);
    err.status = "fail";
    err.data = {
      error: 401,
      message: 'Authorization failed: expired JWT - ' + ex
    };
    err.code = 401;

    return callback(err);
  }


  // sql injection for body payload
  switch (req.method) {
    //case "POST":
    //case "PUT":
    case "DELETE":

      var body = req.body;
      var containsSql = false;
      if (body) {
        if (typeof body !== 'string') {
          body = JSON.stringify(body);
        }
        if (exports.hasSql(body) === true) {
          containsSql = true;
        }
      }
      if (containsSql) {
        console.log("sql-i method: " + req.method);
        console.log("sql-i body: " + body);
        return callback({ "message": "SQL injection detected, request rejected" });
      }
      break;
  }

  callback();
  
}
function getCallerIP(request) {
  try {
    var ip = request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.connection.socket.remoteAddress;
    ip = ip.split(',')[0];
    ip = ip.split(':').slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"
    return ip;
  } catch (e) {
    return "";
  }
}

exports.hasSql = function (value) {

  if (value === null || value === undefined) {
    return false;
  }

  // sql regex reference: http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
  var sql_meta = new RegExp('(%27)|(\')|(--)|(%23)|(#)', 'i');
  if (sql_meta.test(value)) {
    return true;
  }

  var sql_meta2 = new RegExp('((%3D)|(=))[^\n]*((%27)|(\')|(--)|(%3B)|(;))', 'i');
  if (sql_meta2.test(value)) {
    return true;
  }

  var sql_typical = new RegExp('w*((%27)|(\'))((%6F)|o|(%4F))((%72)|r|(%52))', 'i');
  if (sql_typical.test(value)) {
    return true;
  }

  var sql_union = new RegExp('((%27)|(\'))union', 'i');
  if (sql_union.test(value)) {
    return true;
  }

  return false;
}