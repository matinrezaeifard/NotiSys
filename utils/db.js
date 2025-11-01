const mysql = require('mysql2/promise');
require('dotenv').config();

const {
  DB_HOST,
  DB_USER,
  DB_PASS,
  DB_NAME,
  DB_CONN_LIMIT,
} = process.env;

const pool = mysql.createPool({
    host: DB_HOST,   
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: DB_CONN_LIMIT,
    queueLimit: 0
});

async function query(sql, params) {
    try {
        const [rows, fields] = await pool.execute(sql, params);
        return rows;
    } catch (err) {
        console.error('DB Query Error:', err);
        throw err;
    }
}

module.exports = { query, pool };
