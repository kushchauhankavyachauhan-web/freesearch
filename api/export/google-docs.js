const { google } = require('googleapis');
const { getDb, initDb } = require('../_db');
const { handleCors } = require('../_cors');

function sopToPlainText(sop) {
  const lines = [
    `${sop.title}`,
    `${'='.repeat(sop.title.length)}`,
    '',
    `SOP ID: ${sop.sopId}  |  Version: ${sop.version}  |  Department: ${sop.department}`,
    `Owner: ${sop.owner}  |  Frequency: ${sop.frequency}  |  Duration: ${sop.duration}`,
    '',
    'PURPOSE',
    '-------',
    sop.purpose,
    '',
    'SCOPE',
    '-----',
    sop.scope,
    '',
    'STEPS',
    '-----',
  ];

  sop.steps.forEach((step, i) => {
    lines.push(`${i + 1}. ${step.title}`);
    lines.push(`   ${step.description}`);
    lines.push(`   Responsible: ${step.responsible}`);
    lines.push('');
  });

  if (sop.warnings?.length) {
    lines.push('WARNINGS', '--------');
    sop.warnings.forEach(w => lines.push(`! ${w}`));
    lines.push('');
  }

  if (sop.notes?.length) {
    lines.push('NOTES', '-----');
    sop.notes.forEach(n => lines.push(`* ${n}`));
    lines.push('');
  }

  lines.push('SUCCESS CRITERIA', '----------------', sop.successCriteria);
  return lines.join('\n');
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sop } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Google OAuth credentials not configured' });
    }

    await initDb();
    const sql = getDb();

    const tokenRows = await sql`SELECT value FROM settings WHERE key = 'GOOGLE_ACCESS_TOKEN'`;
    if (tokenRows.length === 0) {
      return res.status(401).json({ error: 'Google not authenticated. Please connect Google Docs in Settings.' });
    }
    const accessToken = tokenRows[0].value;

    const refreshRows = await sql`SELECT value FROM settings WHERE key = 'GOOGLE_REFRESH_TOKEN'`;
    const refreshToken = refreshRows.length > 0 ? refreshRows[0].value : null;

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    const docs = google.docs({ version: 'v1', auth: oauth2Client });

    const createResp = await docs.documents.create({ requestBody: { title: sop.title } });
    const docId = createResp.data.documentId;

    const content = sopToPlainText(sop);
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: {
        requests: [
          { insertText: { location: { index: 1 }, text: content } }
        ]
      }
    });

    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
    res.json({ success: true, url: docUrl });
  } catch (err) {
    console.error('Google Docs export error:', err);
    res.status(500).json({ error: err.message || 'Failed to export to Google Docs' });
  }
};
