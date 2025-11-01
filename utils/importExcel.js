const xlsx = require("xlsx");
const { query } = require('./db');
const crypto = require('crypto');

async function dbInsert(data, term_id, group_id) {
  const type = 'weekly';

  const promises = [];

  data.forEach(d => {
    const { title, group_number, host_first, host_last } = d;
    const host = host_first + " " + host_last;

    d.sessions.forEach(s => {
      const id = crypto.randomBytes(16).toString('hex');
      const { day, start, end, place } = s;
      promises.push(
        query(
          'INSERT INTO events (term_id, group_id, id, title, group_number, host, type, day, start, end, place) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [term_id, group_id, id, title, group_number, host, type, day, start, end, place]
        ).catch(err => console.error('Error (./importExcel => dbInsert):', err))
      );
    });
  });

  await Promise.all(promises);
}

function parseExcel(fileBuffer) {
  // Read workbook directly from memory buffer
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });

  // Use the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  const results = rows.map((row) => {
    const rawSession = row[3] || "";
    const sessions = [];

    const parts = rawSession.split("**").map((p) => p.trim()).filter(Boolean);

    for (const part of parts) {
      const match = part.match(/(\S+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*(.+)/);
      if (match) {
        const [, day, start, end, place] = match;
        sessions.push({ day, start, end, place });
      }
    }

    function safeTrim(value) {
      if (value === null || value === undefined) return "";
      return String(value).trim();
    }

    return {
      title: safeTrim(row[0]),
      host_first: safeTrim(row[1]),
      host_last: safeTrim(row[2]),
      group_number: safeTrim(row[4]),
      sessions,
    };
  });

  return results;
}

async function importExcel(fileBuffer, term_id, group_id) {
  const data = parseExcel(fileBuffer);
  await dbInsert(data, term_id, group_id);
}

module.exports = { importExcel };
