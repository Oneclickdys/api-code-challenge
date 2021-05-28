var db = require("../services/db");

exports.get = function (query, callback) {
  var params = [];
  var searchFilter =
    query.search && query.search !== "" ? ` AND el.level LIKE ?` : ``;
  var guidFilter =
    query.guid && query.guid !== "" ? ` AND el.guid = ?` : ``;

  if (searchFilter !== "") {
    params.push(`%${query.search}%`);
  }
  if (guidFilter !== "") {
    params.push(query.guid);
  }

  var sql = `
      SELECT
      {STRING_COLS}
      FROM
      (
        SELECT 
          el.* 
        FROM 
          education_levels el
        WHERE 
          el.deleted_at IS NULL 
          ${searchFilter}
          ${guidFilter}
        ORDER BY 
          el.order
      ) AS t `;

  db.getSlave().query(
    sql.split("{STRING_COLS}").join("COUNT(*) AS amountContents"),
    params,
    function (err, regs) {
      if (err) return callback(err);

      var total = regs[0].amountContents;
      var offset = isNaN(parseInt(query.offset)) ? 0 : parseInt(query.offset);
      var pageSize = isNaN(parseInt(query.pageSize))
        ? 0
        : parseInt(query.pageSize);

      var sqlWithColumns = sql.split("{STRING_COLS}").join(" * ");

      sqlWithColumns += pageSize > 0 ? " LIMIT " + query.pageSize : "";
      sqlWithColumns += offset > 0 ? " OFFSET " + query.offset : "";

      db.getSlave().query(sqlWithColumns, params, function (err, levels) {
        if (err) return callback(err);

        return callback(err, {
          total: total,
          left: total - offset - levels.length,
          pageSize: pageSize,
          offset: offset,
          levels: levels,
        });
      });
    }
  );
};

exports.post = function (data, callback) {
  var sql = `SELECT guid, code, level
      FROM education_levels
      WHERE code = '${data.code}'
      AND level = '${data.level}'
    `;
  db.get().query(sql, (err, result) => {
    if (err) return callback(err);
    if (result && result.length)
      return callback(null, JSON.parse(JSON.stringify(result[0])));

    var sql =
      "INSERT INTO education_levels" +
      " ( guid, code, level, `order`, created_at) " +
      " VALUES " +
      " (?,?,?,?,CURRENT_TIMESTAMP) ";

    db.get().query(sql, [data.guid, data.code, data.order, data.level], (err, result) => {
      if (err) return callback(err);
      if (!result) return callback();
      return callback(null, data);
    });
  });
};

exports.put = function (data, callback) {
  var sql = ` UPDATE education_levels SET code=?, level=?, \`order\`=?, updated_at=NOW() WHERE guid = ?`;
  db.get().query(sql, [data.code, data.level, data.order, data.guid], callback);
};

exports.delete = function (guid, callback) {
  var sql = ` UPDATE education_levels SET deleted_at=NOW() WHERE guid = ?`;
  db.get().query(sql, [guid], callback);
};
