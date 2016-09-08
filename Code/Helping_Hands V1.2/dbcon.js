var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'localhost',
  user  : 'root',
  password: 'enterPassword',
  database: 'enterDatabaseName' 
});

module.exports.pool = pool;