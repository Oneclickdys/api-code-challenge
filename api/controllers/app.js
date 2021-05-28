'use strict';

var responseSrv = require('../services/responses');
var config = require('../../config/config')

module.exports = {
  get: get,
  shutDown: shutDown,
};

function shutDown(req, res) {
  console.log("shutDown app!");
  process.exit(1);
}

function get(req, res) {
  responseSrv.responseSuccess(req, res, {
    "message": "API code challenge v" + config.version
  });
}
