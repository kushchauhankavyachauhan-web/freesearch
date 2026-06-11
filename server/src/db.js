const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'workscribe.db');

let db;

function initDb() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS sops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sop_id TEXT NOT NULL,
      title TEXT NOT NULL,
      department TEXT,
      owner TEXT,
      version TEXT DEFAULT '1.0',
      data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  console.log('Database initialized at', DB_PATH);
}

function getDb() {
  if (!db) initDb();
  return db;
}

module.exports = { initDb, getDb };
