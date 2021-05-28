
function responseError(req, res, error, logData = {}, saveLogging = true) {

  error = !error ? {} : error;

  if (error) {
    if (error.hasOwnProperty("code")) {
      if (typeof error.code === "string") {
        error.codeString = error.code;
        delete error.code;
      }
    }
  }
  console.log(error);
  if (error.hasOwnProperty("sqlMessage")) {
    delete error.sqlMessage;
  }
  if (error.hasOwnProperty("sqlState")) {
    delete error.sqlState;
    delete error.index;
  }
  if (error.hasOwnProperty("sql")) {
    delete error.sql;
  }

  error.code = error.code || 500;
  if (res)
    res.status(error.code).json({ "status": "fail", "error": error });


}

function responseSuccess(req, res, data, logData = {}, saveLogging = true) {
  res.json({ "status": "success", "data": data });
}


module.exports = {
  responseError,
  responseSuccess,
}
