const { neon } = require('@neondatabase/serverless');

let sql;

function getDb() {
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS sops (
      id SERIAL PRIMARY KEY,
      sop_id TEXT NOT NULL,
      title TEXT NOT NULL,
      department TEXT,
      owner TEXT,
      version TEXT DEFAULT '1.0',
      data TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `;
}

module.exports = { getDb, initDb };
