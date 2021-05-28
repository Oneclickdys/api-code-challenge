const CONFIG = require('./config/config');
var mysql = require('mysql');
var migration = require('mysql-migrations');

var connection = mysql.createPool(CONFIG.database);

migration.init(connection, __dirname + '/api/_sql/migrations');