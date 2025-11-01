const express = require('express');
const cors = require('cors');
const multer = require("multer");
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { importExcel } = require("./utils/importExcel");
const htmlTemplates = require('./utils/htmlTemplates');
const { query } = require('./utils/db');

const PORT = 3000;
const upload = multer();
const { LANG } = process.env;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "./client")));

/**
 * IMPORT SECTION
 */
app.post("/api/import", upload.single("file"), async (req, res) => {
    const { term_id, group_id } = req.body;

    try {
        await importExcel(req.file.buffer, term_id, group_id);
        return res.sendStatus(200);

    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }
});

/**
 * ANNOUNCEMENTS SECTION
 */
app.delete('/api/announcements/delete', async (req, res) => {
    const { id } = req.body;

    try {
        const result = await query(
            'DELETE FROM announcements WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 1) {
            return res.sendStatus(200);
        } else {
            return res.sendStatus(404);
        }

    } catch (err) {
        return res.sendStatus(500);
    }
});

app.post('/api/announcements/add', async (req, res) => {
    const { term_id, group_id, message, id } = req.body;

    try {
        if (!term_id || !group_id || !id) return res.sendStatus(400);

        await query(
            'INSERT INTO announcements (term_id, group_id, id, message) VALUES (?, ?, ?, ?)',
            [term_id, group_id, id, message]
        );

        return res.sendStatus(201);

    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * PROGRAMS SECTION
 */
app.delete("/api/programs/delete", async (req, res) => {
    const { id } = req.body;

    try {
        const result = await query(
            'DELETE FROM events WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 1) {
            return res.sendStatus(200);
        } else {
            return res.sendStatus(404);
        }

    } catch (err) {
        return res.sendStatus(500);
    }
});

app.post("/api/programs/add", async (req, res) => {
    const { term_id, group_id, id, title, group_number, host, type, day, start, end, place } = req.body;

    try {
        // Invalid (null) values for term and group
        if (!term_id || !group_id || !id) return res.sendStatus(400);

        await query(
            'INSERT INTO events (term_id, group_id, id, title, group_number, host, type, day, start, end, place) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [term_id, group_id, id, title, group_number, host, type, day, start, end, place]
        );

        // Send response to client
        return res.sendStatus(201);

    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * LOAD SECTION
 */
app.post("/api/load/schedule", async (req, res) => {
    const { term_id, group_id } = req.body;

    try {
        const rows = await query(
            'SELECT * FROM terms WHERE id = ?',
            [term_id]
        );
        if (rows.length === 0) {
            res.sendStatus(404);
        }

        const result = {}

        // Init query
        let sql_events, sql_ann, params;
        sql_events = 'SELECT * FROM events WHERE term_id = ?';
        sql_ann = 'SELECT * FROM announcements WHERE term_id = ?';
        params = [term_id];
        if (group_id !== 1) {
            sql_events += ' AND group_id = ?';
            sql_ann += ' AND group_id = ?';
            params.push(group_id);
        }

        // Db query
        result.events = await query(sql_events, params);
        result.announcements = await query(sql_ann, params);

        // Send response to client
        return res.json(result);

    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * TERM SECTION
 */
app.delete('/api/terms/delete', async (req, res) => {
    const { id } = req.body;

    try {
        const rows = await query(
            'SELECT * FROM terms WHERE id = ?',
            [id]
        );
        if (rows.length === 0) {
            return res.sendStatus(404);
        }

        if (rows[0].is_active === 1) return res.sendStatus(400);

        await query(
            'DELETE FROM terms WHERE id = ?',
            [id]
        );

        return res.sendStatus(200);

    } catch (err) {
        return res.sendStatus(500);
    }
});

app.get('/api/terms/end', async (req, res) => {
    try {
        await query('UPDATE terms SET is_active = 0');

        // Send final response to client
        return res.sendStatus(200);

    } catch (err) {
        return res.sendStatus(500);
    }
});

app.post('/api/terms/activate', async (req, res) => {
    const { id } = req.body;

    try {
        await query('UPDATE terms SET is_active = 0');

        await query(
            'UPDATE terms SET is_active = 1 WHERE id = ?',
            [id]
        );

        return res.sendStatus(200);

    } catch (err) {
        return res.sendStatus(500);
    }
});

app.post('/api/terms/new', async (req, res) => {
    const { name } = req.body;

    try {
        // Invalid (null) input
        if (!name) return res.sendStatus(400);

        await query('UPDATE terms SET is_active = 0');

        await query(
            'INSERT INTO terms (name, is_active) VALUES (?, ?)',
            [name, true]
        );

        // Send final response to client
        return res.sendStatus(201);

    } catch (err) {
        return res.sendStatus(500);
    }
});

app.get('/api/terms', async (req, res) => {
    try {
        // Read db
        const terms = await query('SELECT * FROM terms');

        // Send final response to client
        return res.json({ terms });

    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * USERS SECTION
 */
app.delete('/api/users/del/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const result = await query(
            'DELETE FROM admins WHERE username = ?',
            [username]
        );

        if (result.affectedRows === 1) {
            return res.sendStatus(200);
        } else {
            return res.sendStatus(404);
        }

    } catch (err) {
        return res.sendStatus(500);
    }
});

app.put('/api/users/update/:username/password', async (req, res) => {
    const { password } = req.body;
    const username = req.params.username;

    try {
        // Overwrite password and update db
        const result = await query(
            'UPDATE admins SET password = ? WHERE username = ?',
            [password, username]
        );

        if (result.affectedRows === 1) {
            return res.sendStatus(200);
        } else {
            return res.sendStatus(404);
        }

    } catch (err) {
        return res.sendStatus(500);
    }
});

app.post('/api/users/add', async (req, res) => {
    const { username, password, group } = req.body;

    try {
        // Invalid (null) inputs
        if (!username || !password || !group) return res.sendStatus(400);

        await query(
            'INSERT INTO admins (username, password, group_id) VALUES (?, ?, ?)',
            [username, password, group]
        );

        // Send final response to client
        return res.sendStatus(201);

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.sendStatus(409);
        } else {
            return res.sendStatus(500);
        }
    }
});

app.get('/api/users', async (req, res) => {
    try {
        // Read db
        const users = await query('SELECT * FROM admins');

        // Send final response to client
        return res.json({ users });

    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * GROUPS SECTION
 */
app.get('/api/groups', async (req, res) => {
    try {
        // Read db
        const groups = await query('SELECT * FROM groups');

        // Send final response to client
        return res.json({ groups });

    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * LOGIN SECTION
 */
app.post('/api/login', async (req, res) => {
    const { username, password, role, lang } = req.body;

    try {
        // Select table by the role
        let tableName;
        if (role === "expert") {
            tableName = 'admins';
        } else if (role === "admin") {
            tableName = 'super_admins';
        } else {
            // Invalid role
            return res.sendStatus(400);
        }

        // Get user
        const users = await query(
            `SELECT * FROM ${tableName} WHERE username = ? AND password = ?`,
            [username, password]
        );

        // Check user
        if (users.length === 0) {
            return res.sendStatus(401);
        }

        let html;
        if (role === "expert") {
            html = htmlTemplates.expertDashboard(username, users[0].group_id, lang);
        } else {
            html = htmlTemplates.adminDashboard(lang);
        }

        // Successful login
        return res.send(html);

    } catch (err) {
        return res.sendStatus(500);
    }
});

/**
 * SETUP SECTION
 */
app.post('/api/setup', async (req, res) => {
    const { adminData, groups, css } = req.body;

    try {
        await query(
            'INSERT INTO super_admins (username, password) VALUES (?, ?)',
            [adminData.username, adminData.password]
        );

        for (const g of groups) {
            await query(
                'INSERT INTO groups (name) VALUES (?)',
                [g]
            );
        }

        const cssPath = path.join(__dirname, 'client', 'css', 'color.css');
        fs.writeFileSync(cssPath, css, 'utf-8');

        return res.sendStatus(200);

    } catch (err) {
        console.error(err);
        return res.sendStatus(500);
    }
});

/**
 * PAGE NAVIGATION
 */
app.use(express.static(path.join(__dirname, 'client')));

function sendHTML(res, page, lang = LANG) {
    const safeLang = lang === "en" ? "en" : "fa";
    return res.sendFile(path.join(__dirname, `./client/${page}-${safeLang}.html`));
}

app.get(["/", "/:root", "/dashboard/:root"], async (req, res) => {
    const groups = await query("SELECT * FROM groups");
    if (groups.length === 0) {
        return res.sendFile(path.join(__dirname, "./client/setup.html"));
    }

    const { root } = req.params || {};

    if (!root) return sendHTML(res, "index");
    if (root === "dashboard") return sendHTML(res, "dashboard");
    if (req.path.startsWith("/dashboard")) return sendHTML(res, "dashboard", root ? root : LANG);
    if (root === "fa" || root === "en") return sendHTML(res, "index", root);

    return res.sendStatus(404);
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
    console.log(`✅ Server running on port: ${PORT}`);
});
