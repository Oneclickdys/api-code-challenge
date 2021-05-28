'use strict';

const CONFIG = require('./config/config');
const db = require('./api/services/db');

const ensureAuth = require('./api/services/ensureAuth');
var models = null; // load after ddbbs connections
var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-ui-express');
var express = require('express');
var app = express();
var cors = require('cors');
var cookieParser = require('cookie-parser');
var resolve = require('json-refs').resolveRefs;
var YAML = require('yamljs');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');
var jwt = require('jwt-simple');

var options = {
  filter: ['relative', 'remote'],
  resolveCirculars: false,
  loaderOptions: {
    processContent: function (res, callback) {
      callback(YAML.parse(res.text));
    }
  }
};
var swaggerDocumentLoaded = "";

resolve(swaggerDocument, options)
  .then(function (results) {
    // console.log(results.refs)
    swaggerDocumentLoaded = results.resolved;
    console.log('-----SWAGGER YAML LOADED, INIT DOCS-------')

    //loading api docs - using reensambled yaml file
    app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(swaggerDocumentLoaded));
    //console.log(results.resolved)
  })
  .catch(function (reason) {
    console.log(reason.stack)
  });


module.exports = app;

//setting swagger AUTH BASIC HANDLER
var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    BasicAuth: ensureAuth.ensureAuth
  }
};

// database connection initialize
// Pre condition to start API (1)
db.connect(function (err) {
  if (err) {
    console.log('Unable to connect to MySQL.');
    process.exit(1);
  } else {
    console.log('Mysql conected.');
    startAPI();
  }
});

// API Start when pre condition's are completed
function startAPI() {

  app.enable('trust proxy');

  app.use(cookieParser());

  // CORS
  app.use(cors());

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    if (CONFIG.SSL_STRIPPING) {
      res.header('Strict-Transport-Security', CONFIG.SSL_STRIPPING);
    }
    next();
  });

  // sql-injection middleware 
  app.use((req, res, next) => {

    var containsSql = false;
    if (req.originalUrl.indexOf("/cms/metascraper") >= 0) return next(); // sql injection disabled for metascraper service
    if (req.originalUrl.indexOf("/content/upload-complete") >= 0) return next(); // sql injection disabled for upload complete callback
    if (req.originalUrl !== null && req.originalUrl !== undefined) {
      if (ensureAuth.hasSql(req.originalUrl) === true) {
        containsSql = true;
      }
    }
    if (containsSql)
      return responseError();

    // No controlamos el body porque detecta sql injections en payloads "normales"
    return next();

    function responseError() {
      res.status(403).json({ "status": "fail", "message": "SQL in request detected, rejected." });
    }

  });


  var bodyParser = require('body-parser');
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

  SwaggerExpress.create(config, function (err, swaggerExpress) {
    if (err) { throw err; }

    // install middleware
    swaggerExpress.register(app);

    var port = CONFIG.port;

    var server = app.listen(port, function () {
      console.log("API code challenge v" + CONFIG.version + " running on port: " + port);
    });


    // start tasks
    models = require('./api/models');
    
  });
}

