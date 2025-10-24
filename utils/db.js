const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',   
    user: 'localuser',
    password: 'Local#1234',
    database: 'notisys',
    waitForConnections: true,
    connectionLimit: 10,
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
