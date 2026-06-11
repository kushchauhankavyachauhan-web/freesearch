# Workscribe

**Speak once. Document forever.**

Workscribe is an AI-powered SOP (Standard Operating Procedure) generator that converts your voice or text into professional documentation using Claude.

## Features

- 🎙 **Voice Input** — Speak naturally; real-time transcript shown on screen
- ✏️ **Text Input** — Type your process as a fallback
- 🤖 **AI Generation** — Claude structures your input into a complete SOP
- 📄 **PDF Export** — Download a professionally formatted PDF
- 🔗 **Notion Export** — Push SOPs directly to Notion
- 📝 **Google Docs Export** — Create Google Docs via OAuth
- 📋 **Copy as Text** — Plain text for any use
- 📚 **History** — All SOPs auto-saved; browse and revisit anytime

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js 18+, Express |
| Database | SQLite (better-sqlite3) |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Speech | Web Speech API (Chrome built-in) |
| PDF | @react-pdf/renderer |
| Notion | @notionhq/client |
| Google | googleapis (OAuth2) |

## Project Structure

```
workscribe/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── components/  # Layout, SopDocument, ExportPanel, SopPDF
│   │   ├── hooks/       # useSpeech (Web Speech API)
│   │   ├── pages/       # Home, History, SopView, Settings
│   │   └── utils/       # api.js (fetch wrapper)
│   └── package.json
├── server/              # Express backend
│   ├── src/
│   │   ├── routes/      # sop.js, export.js, settings.js
│   │   ├── db.js        # SQLite setup
│   │   └── index.js     # Entry point
│   └── package.json
├── data/                # SQLite database (auto-created)
├── .env                 # Your API keys (git-ignored)
├── .env.example         # Template
└── README.md
```

## Quick Setup

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key (minimum required):

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Run

Open two terminals:

```bash
# Terminal 1 — Server
cd server
npm run dev    # or: npm start

# Terminal 2 — Client
cd client
npm run dev
```

Open **http://localhost:5173** in Chrome.

> **Note:** Voice input requires Chrome (or any browser supporting the Web Speech API).

---

## API Key Setup

### Anthropic (Required)

1. Go to [console.anthropic.com](https://console.anthropic.com/account/keys)
2. Create an API key
3. Add to `.env` as `ANTHROPIC_API_KEY`

Or paste it in the app's Settings page — it saves to `.env` automatically.

### Notion (Optional)

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) → New integration
2. Copy the **Internal Integration Token**
3. Share your target Notion page with the integration
4. Copy the **Page ID** from the URL (`notion.so/Page-Title-**[PAGE_ID]**`)
5. Add both to Settings in the app

### Google Docs (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project → Enable **Google Docs API** and **Google Drive API**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add `http://localhost:3001/api/export/google/callback` as an authorized redirect URI
5. Add Client ID and Client Secret to Settings in the app
6. Click **Connect Google Account** in Settings to authorize

---

## How It Works

1. **Speak or type** your process description
2. The transcript is sent to the Express backend
3. The backend calls **Claude API** with a structured system prompt
4. Claude returns a complete SOP in JSON format
5. The SOP is saved to **SQLite** and displayed
6. Export via PDF, Notion, Google Docs, or copy as text

## SOP JSON Structure

```json
{
  "title": "...",
  "sopId": "SOP-001",
  "version": "1.0",
  "department": "...",
  "owner": "...",
  "frequency": "...",
  "duration": "...",
  "purpose": "...",
  "scope": "...",
  "steps": [{ "title": "...", "description": "...", "responsible": "..." }],
  "warnings": ["..."],
  "notes": ["..."],
  "successCriteria": "..."
}
```

## Security Notes

- API keys are stored only in your local `.env` file
- The `.env` file is git-ignored
- All AI/Notion/Google API calls happen server-side only
- Google OAuth tokens are stored in memory (server session only)
- Never expose your backend to the public internet without adding authentication

## License

MIT
