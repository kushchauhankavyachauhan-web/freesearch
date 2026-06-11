const { getDb, initDb } = require('./_db');
const { handleCors } = require('./_cors');

// Keys that come from environment variables (not stored in DB)
const ENV_ONLY_KEYS = [
  'GROQ_API_KEY',
  'ANTHROPIC_API_KEY',
  'NOTION_TOKEN',
  'NOTION_PAGE_ID',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
];

// Keys stored in the settings table in Neon
const DB_KEYS = [
  'GROQ_API_KEY',
  'ANTHROPIC_API_KEY',
  'NOTION_TOKEN',
  'NOTION_PAGE_ID',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
];

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  await initDb();
  const sql = getDb();

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT key, value FROM settings`;
      const dbVars = Object.fromEntries(rows.map(r => [r.key, r.value]));

      // Merge: env vars take priority at runtime, but report what's set either way
      const get = (key) => process.env[key] || dbVars[key] || '';

      res.json({
        groqKeySet: !!get('GROQ_API_KEY'),
        anthropicKeySet: !!get('ANTHROPIC_API_KEY'),
        notionTokenSet: !!get('NOTION_TOKEN'),
        notionPageId: get('NOTION_PAGE_ID'),
        googleClientId: get('GOOGLE_CLIENT_ID'),
        googleClientSecretSet: !!get('GOOGLE_CLIENT_SECRET'),
        googleRedirectUri: get('GOOGLE_REDIRECT_URI'),
        googleConnected: !!(dbVars['GOOGLE_ACCESS_TOKEN']),
      });
    } catch (err) {
      console.error('Settings GET error:', err);
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      for (const key of DB_KEYS) {
        const value = req.body[key];
        if (value !== undefined && value !== '') {
          await sql`
            INSERT INTO settings (key, value) VALUES (${key}, ${value})
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
          `;
        }
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Settings POST error:', err);
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
