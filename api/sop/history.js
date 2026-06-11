const { getDb, initDb } = require('../_db');
const { handleCors } = require('../_cors');

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDb();
    const sql = getDb();

    const rows = await sql`
      SELECT id, sop_id, title, department, owner, version, created_at
      FROM sops
      ORDER BY created_at DESC
    `;

    res.json(rows);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: err.message });
  }
}
