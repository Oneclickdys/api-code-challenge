var config = require('../../config/config');
var mysql = require('mysql')
  , async = require('async');

exports.MODE_TEST = 'mode_test'
exports.MODE_PRODUCTION = 'mode_production'

var state = {
  pool: null
}
var stateLog = {
  pool: null
}
var stateConsumption = {
  pool: null
}
var stateSessions = {
  pool: null
}
var stateSlaves = new Array();

exports.connect = function (done) {
  console.log(`database.connectionLimit: ${config.database.connectionLimit}`);

  state.pool = mysql.createPool(config.database);

  // state.pool.on('acquire', function (connection) {
  //   console.log('Connection %d acquired', connection.threadId);
  // });
  // state.pool.on('enqueue', function () {
  //   console.log('Waiting for available connection slot'); 
  // });
  // state.pool.on('release', function (connection) { 
  //   console.log('Connection %d released', connection.threadId);
  // }); 
  done();
}
exports.connectLog = function (done) {
  console.log(`databaseLog.connectionLimit: ${config.databaseLog.connectionLimit}`);
  stateLog.pool = mysql.createPool(config.databaseLog);
  done();
}
exports.connectConsumption = function (done) {
  console.log(`databaseConsumptions.connectionLimit: ${config.databaseConsumptions.connectionLimit}`);
  stateConsumption.pool = mysql.createPool(config.databaseConsumptions);
  done();
}

exports.connectSessions = function (done) {
  console.log(`databaseSessions.connectionLimit: ${config.databaseSessions.connectionLimit}`);
  stateSessions.pool = mysql.createPool(config.databaseSessions);
  done();
}

exports.connectSlaves = function (done) {

  if (config.databaseSlaves.host === "") {
    console.log("Mysql SLAVE off");
    return done();
  }

  var hostAr = String(config.databaseSlaves.host).split(",");
  var databaseAr = String(config.databaseSlaves.database).split(",");
  var userAr = String(config.databaseSlaves.user).split(",");
  var connectionLimitAr = String(config.databaseSlaves.connectionLimit).split(",");

  if (hostAr.length === 0 || databaseAr.length === 0 || userAr.length === 0 || connectionLimitAr.length === 0) {
    console.log("SLAVE DATABASE config not found or missing params");
    return done();
  }
  var amount = hostAr.length;
  console.log("Mysql SLAVE connections: " + amount);
  for (var i = 0; i < amount; i++) {
    var state = {
      pool: null
    }
    var connectionLimit = connectionLimitAr[i] || connectionLimitAr[0];
    state.pool = mysql.createPool({
      host: hostAr[i] || hostAr[0],
      database: databaseAr[i] || databaseAr[0],
      user: userAr[i] || userAr[0],
      password: config.databaseSlaves.password,
      multipleStatements: config.databaseSlaves.multipleStatements || true,
      connectionLimit: connectionLimit,
    });

    console.log("Mysql SLAVE connectionLimit " + i + ": " + connectionLimit);

    stateSlaves.push(state);
  }

  done();
}

exports.get = function () {
  return state.pool;
}

exports.getSlave = function () {
  // if not have slave, return main db connection
  if (stateSlaves.length === 0)
    return state.pool;

  // have slave, select random connection
  var position = Math.floor(Math.random() * stateSlaves.length);
  //console.log(`getSlave(): ` + position);
  return stateSlaves[position].pool;
}

exports.getLog = function () {
  return stateLog.pool;
}

exports.getConsumption = function () {
  return stateConsumption.pool;
}

exports.getSessions = function () {
  return stateSessions.pool;
}

exports.execBulk = function (bulk, db, callback) {

  var amount = bulk.length;
  var pointer = 0;
  var limitOfBatch = 20000;

  // TODO: prepare sql batch limited by content size, reading:
  // show variables like 'max_allowed_packet';

  function next() {

    if (pointer >= amount)
      return callback(false, bulk);

    var amountParams = bulk[pointer].params.length;

    bulk[pointer].batches = new Array();

    var i, j;
    for (i = 0, j = bulk[pointer].params.length; i < j; i += limitOfBatch) {
      bulk[pointer].batches.push(bulk[pointer].params.slice(i, i + limitOfBatch));
    }

    var amountBatches = bulk[pointer].batches.length;
    var pointerBatches = 0;

    console.log("Bulk number: " + (pointer + 1) + " of " + amount);
    console.log("Amount queries: " + amountParams + " limitOfBatch: " + limitOfBatch);
    console.log("Amount batches: " + amountBatches);

    function nextBatch() {
      if (pointerBatches >= amountBatches) {
        pointer++;
        next();
      } else {

        db.query(bulk[pointer].sql, [bulk[pointer].batches[pointerBatches]], function (err) {
          if (err) return callback(err);
          pointerBatches++;
          console.log("Sql batch complete: " + pointerBatches + " of " + amountBatches);
          nextBatch();
        });
      }
    }
    nextBatch();
  }
  next();
}