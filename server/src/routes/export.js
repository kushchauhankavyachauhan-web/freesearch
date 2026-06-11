const express = require('express');
const { Client } = require('@notionhq/client');
const { google } = require('googleapis');

const router = express.Router();

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
    sop.warnings.forEach(w => lines.push(`⚠ ${w}`));
    lines.push('');
  }

  if (sop.notes?.length) {
    lines.push('NOTES', '-----');
    sop.notes.forEach(n => lines.push(`• ${n}`));
    lines.push('');
  }

  lines.push('SUCCESS CRITERIA', '----------------', sop.successCriteria);
  return lines.join('\n');
}

router.post('/notion', async (req, res) => {
  try {
    const { sop } = req.body;
    const notionToken = process.env.NOTION_TOKEN;
    const notionPageId = process.env.NOTION_PAGE_ID;

    if (!notionToken) return res.status(400).json({ error: 'Notion API token not configured' });
    if (!notionPageId) return res.status(400).json({ error: 'Notion page ID not configured' });

    const notion = new Client({ auth: notionToken });

    const blocks = [
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ type: 'text', text: { content: `${sop.sopId} | v${sop.version} | ${sop.department} | Owner: ${sop.owner} | Frequency: ${sop.frequency} | Duration: ${sop.duration}` } }],
          icon: { emoji: '📋' },
          color: 'purple_background'
        }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: 'Purpose' } }] }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: sop.purpose } }] }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: 'Scope' } }] }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: sop.scope } }] }
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: 'Steps' } }] }
      },
      ...sop.steps.map((step, i) => ({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: [
            { type: 'text', text: { content: `${step.title}: ` }, annotations: { bold: true } },
            { type: 'text', text: { content: `${step.description} (Responsible: ${step.responsible})` } }
          ]
        }
      })),
    ];

    if (sop.warnings?.length) {
      blocks.push(
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Warnings' } }] } },
        ...sop.warnings.map(w => ({
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: [{ type: 'text', text: { content: w } }],
            icon: { emoji: '⚠️' },
            color: 'yellow_background'
          }
        }))
      );
    }

    if (sop.notes?.length) {
      blocks.push(
        { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Notes' } }] } },
        ...sop.notes.map(n => ({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: { rich_text: [{ type: 'text', text: { content: n } }] }
        }))
      );
    }

    blocks.push(
      { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: 'Success Criteria' } }] } },
      { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: sop.successCriteria } }] } }
    );

    const page = await notion.pages.create({
      parent: { page_id: notionPageId },
      properties: {
        title: { title: [{ text: { content: sop.title } }] }
      },
      children: blocks
    });

    res.json({ success: true, url: page.url });
  } catch (err) {
    console.error('Notion export error:', err);
    res.status(500).json({ error: err.message || 'Failed to export to Notion' });
  }
});

router.get('/google/auth', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/export/google/callback';

  if (!clientId || !clientSecret) {
    return res.status(400).json({ error: 'Google OAuth credentials not configured' });
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive.file'],
    prompt: 'consent'
  });

  res.json({ authUrl });
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/export/google/callback';

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens temporarily — in production use a proper session/DB store
    process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token;
    if (tokens.refresh_token) process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;

    res.redirect((process.env.CLIENT_URL || 'http://localhost:5173') + '/settings?google=connected');
  } catch (err) {
    res.redirect((process.env.CLIENT_URL || 'http://localhost:5173') + '/settings?google=error');
  }
});

router.post('/google-docs', async (req, res) => {
  try {
    const { sop } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/export/google/callback';

    if (!clientId || !clientSecret) {
      return res.status(400).json({ error: 'Google OAuth credentials not configured' });
    }

    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(401).json({ error: 'Google not authenticated. Please connect Google Docs in Settings.' });
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const createResp = await docs.documents.create({ requestBody: { title: sop.title } });
    const docId = createResp.data.documentId;

    const requests = [];
    let cursor = 1;

    const insert = (text, index) => {
      requests.push({ insertText: { location: { index }, text } });
      return index + text.length;
    };

    const setStyle = (startIndex, endIndex, style) => {
      requests.push({
        updateParagraphStyle: {
          range: { startIndex, endIndex },
          paragraphStyle: { namedStyleType: style },
          fields: 'namedStyleType'
        }
      });
    };

    // Build document content
    const content = sopToPlainText(sop);
    cursor = insert(content, cursor);

    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests }
    });

    const docUrl = `https://docs.google.com/document/d/${docId}/edit`;
    res.json({ success: true, url: docUrl });
  } catch (err) {
    console.error('Google Docs export error:', err);
    res.status(500).json({ error: err.message || 'Failed to export to Google Docs' });
  }
});

module.exports = router;
