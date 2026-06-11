const { getDb, initDb } = require('../_db');
const { handleCors } = require('../_cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  try {
    await initDb();
    const sql = getDb();

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM sops WHERE id = ${id}`;
      if (rows.length === 0) return res.status(404).json({ error: 'SOP not found' });
      const row = rows[0];
      return res.json({ ...row, data: JSON.parse(row.data) });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM sops WHERE id = ${id}`;
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('SOP [id] error:', err);
    res.status(500).json({ error: err.message });
  }
}
