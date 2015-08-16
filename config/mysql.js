
var mysql = require('mysql');



var conn = function() {
  var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    multipleStatements: true
  });

  connection.connect(function (err) {
    if (err) {
      console.log("SQL CONNECT ERROR: " + err);
    } else {
      console.log("SQL CONNECT SUCCESSFUL.");
    }
  });
  exports.conn = connection
}

conn();

