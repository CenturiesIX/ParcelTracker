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
};
