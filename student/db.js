const mysql = require('mysql');
const conn = mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'root',
    database:'xiu',
    multipleStatements: true        // 这句话就是一次性执行多个sql语句   配置项
})
conn.connect();
module.exports = conn;