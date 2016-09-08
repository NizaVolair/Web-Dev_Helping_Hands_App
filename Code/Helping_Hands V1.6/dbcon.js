var mysql = require('mysql');
var pool = mysql.createPool({
  host  : 'localhost',
  user  : 'root',
  password: 'apple44',
  database: 'sys' 
});

module.exports.pool = pool;