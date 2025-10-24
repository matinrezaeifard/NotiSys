const { pool } = require('./utils/db');

async function createTables() {
    try {
        const connection = await pool.getConnection();

        await connection.query(`
            CREATE TABLE IF NOT EXISTS groups (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS super_admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                group_id INT,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS terms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                is_active BOOLEAN DEFAULT FALSE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS events (
                id CHAR(36) PRIMARY KEY,       
                title VARCHAR(255) NOT NULL,
                group_number INT NOT NULL,
                host VARCHAR(100),
                type ENUM('weekly','one-time') NOT NULL,
                day VARCHAR(20),            
                start VARCHAR(255),
                end VARCHAR(255),             
                place VARCHAR(255),
                group_id INT NOT NULL,
                term_id INT NOT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
                FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS announcements (
                id CHAR(36) PRIMARY KEY,       
                message TEXT NOT NULL,
                group_id INT NOT NULL,
                term_id INT NOT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
                FOREIGN KEY (term_id) REFERENCES terms(id) ON DELETE CASCADE
            )
        `);

        console.log('Tables created successfully!');
        connection.release();
    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        await pool.end();
    }
}

createTables();
