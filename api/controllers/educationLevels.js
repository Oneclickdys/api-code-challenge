"use strict";

var models = require("../models/index");
var responseSrv = require("../services/responses");
const uuid = require("uuid/v4");
var CONFIG = require("../../config/config");

module.exports = {
  get: get,
  getOne: getOne,
  post: post,
  put: put,
  delete: $delete,
};

function get(req, res) {
  models.educationLevels.get(req.query, function (err, data) {
    if (err) return responseSrv.responseError(req, res, err);
    responseSrv.responseSuccess(req, res, data);
  });
}
function getOne(req, res) {
  req.query.guid = req.swagger.params.guid.value;
  models.educationLevels.get(req.query, function (err, data) {
    if (err) return responseSrv.responseError(req, res, err);
    if (data.levels.length == 0)
      return responseSrv.responseError(req, res, {
        code: 404,
        message: "Not found",
      });
    responseSrv.responseSuccess(req, res, data.levels[0]);
  });
}

function post(req, res) {
  var newEducationLevel = req.body;

  newEducationLevel.guid = uuid();
  newEducationLevel.code = newEducationLevel.code || "";
  newEducationLevel.level = newEducationLevel.level || "";
  newEducationLevel.order = newEducationLevel.order || 1;

  models.educationLevels.post(
    newEducationLevel,
    (err, storedEducationLevel) => {
      if (err) {
        responseSrv.responseError(req, res, err);
      } else {
        responseSrv.responseSuccess(
          req,
          res,
          storedEducationLevel || newEducationLevel
        );
      }
    }
  );
}
function put(req, res) {
  var educationLevel = req.body;

  educationLevel.guid = req.swagger.params.guid.value;
  educationLevel.code = educationLevel.code || "";
  educationLevel.level = educationLevel.level || "";
  educationLevel.order = educationLevel.order || 0;

  models.educationLevels.put(educationLevel, (err) => {
    if (err) return responseSrv.responseError(req, res, err);
    responseSrv.responseSuccess(req, res, educationLevel);
  });
}
function $delete(req, res) {
  models.educationLevels.delete(
    req.swagger.params.guid.value,
    (err, result) => {
      if (err) return responseSrv.responseError(req, res, err);
      responseSrv.responseSuccess(req, res, {
        affectedRows: result.affectedRows,
      });
    }
  );
}
