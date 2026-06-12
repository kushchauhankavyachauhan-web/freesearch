import Groq from 'groq-sdk';
import { v4 as uuid } from 'uuid';
import { getDb } from './_db.js';
import { authenticate, setCors } from './_middleware.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function ask(prompt, system) {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    max_tokens: 1024,
    temperature: 0.4,
  });
  return res.choices[0].message.content;
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = authenticate(req, res);
  if (!user) return;

  const { content, action } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  const db = getDb();
  const profile = db.prepare('SELECT * FROM life_profiles WHERE user_id = ?').get(user.userId);
  const goals = JSON.parse(profile?.goals || '[]');
  const people = JSON.parse(profile?.priority_people || '[]');
  const today = new Date().toISOString().split('T')[0];

  if (action === 'filter') {
    try {
      const text = await ask(
        `Filter this content and return only what matters:\n\n${content}`,
        `You are Lifen's AI filtering intelligence. Life Profile — Goals: ${goals.join(', ') || 'Not set'}. Priority People: ${people.join(', ') || 'Not set'}. Be ruthless — filter noise. Return ONLY valid JSON (no markdown, no explanation): {"items":[{"priority":1,"title":"...","reason":"...","category":"goal|person|urgent|opportunity"}],"summary":"..."}. Max 5 items.`
      );
      let parsed;
      try { const m = text.match(/\{[\s\S]*\}/); parsed = JSON.parse(m ? m[0] : text); }
      catch { parsed = { items: [{ priority: 1, title: 'AI Response', reason: text, category: 'urgent' }], summary: 'Processed.' }; }
      db.prepare('INSERT INTO notes (id,user_id,content,ai_response) VALUES (?,?,?,?)').run(uuid(), user.userId, content, JSON.stringify(parsed));
      db.prepare('INSERT INTO daily_briefs (id,user_id,date,items) VALUES (?,?,?,?) ON CONFLICT(user_id,date) DO UPDATE SET items=?').run(uuid(), user.userId, today, JSON.stringify(parsed.items), JSON.stringify(parsed.items));
      return res.json(parsed);
    } catch (err) {
      return res.status(500).json({ error: 'AI failed', detail: err.message });
    }
  }

  if (action === 'daily-brief') {
    const brief = db.prepare('SELECT * FROM daily_briefs WHERE user_id=? AND date=?').get(user.userId, today);
    if (brief) return res.json({ items: JSON.parse(brief.items), date: today });
    try {
      const text = await ask(
        `Generate a daily brief for today (${today}). Goals: ${goals.join(', ') || 'not set yet'}. Priority people: ${people.join(', ') || 'none set'}. Return ONLY valid JSON (no markdown): {"items":[{"priority":1,"title":"...","reason":"...","category":"goal"}],"summary":"..."}. Max 5 motivating items.`
      );
      let parsed;
      try { const m = text.match(/\{[\s\S]*\}/); parsed = JSON.parse(m ? m[0] : text); }
      catch { parsed = { items: [{ priority: 1, title: 'Start your day with intention', reason: 'Review your goals', category: 'goal' }], summary: 'Make today count.' }; }
      db.prepare('INSERT OR REPLACE INTO daily_briefs (id,user_id,date,items) VALUES (?,?,?,?)').run(uuid(), user.userId, today, JSON.stringify(parsed.items));
      return res.json({ ...parsed, date: today });
    } catch {
      return res.json({ items: [{ priority: 1, title: 'Set up your Life Profile', reason: 'Add goals to get AI-powered briefs', category: 'goal' }], summary: 'Complete your setup.', date: today });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}
