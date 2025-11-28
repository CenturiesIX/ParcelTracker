const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'tracketta.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(dbPath)) {
  fs.closeSync(fs.openSync(dbPath, 'w'));
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database', err);
  }
});

const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema, (err) => {
  if (err) {
    console.error('Failed to initialize database schema', err);
  }
});

const ensureSettingsRow = () =>
  new Promise((resolve, reject) => {
    db.get('SELECT * FROM settings WHERE id = 1', (err, row) => {
      if (err) return reject(err);
      if (row) return resolve(row);
      const defaultRow = {
        id: 1,
        theme: 'system',
        animationsEnabled: 1,
        defaultCarrier: 'auto',
      };
      db.run(
        'INSERT INTO settings (id, theme, animationsEnabled, defaultCarrier) VALUES (1, ?, ?, ?)',
        [defaultRow.theme, defaultRow.animationsEnabled, defaultRow.defaultCarrier],
        (insertErr) => {
          if (insertErr) return reject(insertErr);
          resolve(defaultRow);
        }
      );
    });
  });

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function callback(err) {
    if (err) {
      reject(err);
    } else {
      resolve({ id: this.lastID, changes: this.changes });
    }
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) {
      reject(err);
    } else {
      resolve(row);
    }
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) {
      reject(err);
    } else {
      resolve(rows);
    }
  });
});

module.exports = {
  db,
  run,
  get,
  all,
  ensureSettingsRow,
};

ensureSettingsRow().catch((err) => console.error('Failed to seed settings row', err));
