const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const ENV_PATH = path.join(__dirname, '../../../.env');

function readEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return {};
  const content = fs.readFileSync(ENV_PATH, 'utf-8');
  return Object.fromEntries(
    content.split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => {
        const idx = line.indexOf('=');
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      })
  );
}

function writeEnvFile(vars) {
  const lines = Object.entries(vars)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  fs.writeFileSync(ENV_PATH, lines + '\n');
}

const SENSITIVE_KEYS = ['ANTHROPIC_API_KEY', 'NOTION_TOKEN', 'GOOGLE_CLIENT_SECRET'];

router.get('/', (req, res) => {
  const vars = readEnvFile();
  const safe = {};
  for (const [k, v] of Object.entries(vars)) {
    safe[k] = SENSITIVE_KEYS.includes(k) && v ? '***SET***' : v;
  }
  res.json({
    anthropicKeySet: !!vars.ANTHROPIC_API_KEY,
    notionTokenSet: !!vars.NOTION_TOKEN,
    notionPageId: vars.NOTION_PAGE_ID || '',
    googleClientId: vars.GOOGLE_CLIENT_ID || '',
    googleClientSecretSet: !!vars.GOOGLE_CLIENT_SECRET,
    googleRedirectUri: vars.GOOGLE_REDIRECT_URI || '',
    googleConnected: !!process.env.GOOGLE_ACCESS_TOKEN
  });
});

router.post('/', (req, res) => {
  try {
    const vars = readEnvFile();

    const allowed = [
      'ANTHROPIC_API_KEY',
      'NOTION_TOKEN',
      'NOTION_PAGE_ID',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_REDIRECT_URI'
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined && req.body[key] !== '') {
        vars[key] = req.body[key];
        process.env[key] = req.body[key];
      }
    }

    writeEnvFile(vars);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
