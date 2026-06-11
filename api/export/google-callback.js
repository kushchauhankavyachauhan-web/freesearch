const { google } = require('googleapis');
const { getDb, initDb } = require('../_db');
const { handleCors } = require('../_cors');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientUrl = process.env.CLIENT_URL || 'https://workscribe.vercel.app';

  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${clientUrl}/settings?google=error`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    await initDb();
    const sql = getDb();

    await sql`
      INSERT INTO settings (key, value) VALUES ('GOOGLE_ACCESS_TOKEN', ${tokens.access_token})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;

    if (tokens.refresh_token) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('GOOGLE_REFRESH_TOKEN', ${tokens.refresh_token})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }

    res.redirect(`${clientUrl}/settings?google=connected`);
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect(`${clientUrl}/settings?google=error`);
  }
};
