import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuid } from 'uuid';
import { getDb } from './_db.js';
import { authenticate, setCors } from './_middleware.js';
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6', max_tokens: 1024,
        system: `You are Lifen's AI filtering intelligence. Life Profile — Goals: ${goals.join(', ')||'Not set'}. Priority People: ${people.join(', ')||'Not set'}. Return JSON: {"items":[{"priority":1,"title":"...","reason":"...","category":"goal|person|urgent|opportunity"}],"summary":"..."}. Max 5 items. Be ruthless — filter noise.`,
        messages: [{ role: 'user', content: `Filter this:\n\n${content}` }],
      });
      const text = message.content[0].text;
      let parsed;
      try { const m = text.match(/\{[\s\S]*\}/); parsed = JSON.parse(m ? m[0] : text); }
      catch { parsed = { items: [{ priority: 1, title: 'AI Response', reason: text, category: 'urgent' }], summary: 'Processed.' }; }
      db.prepare('INSERT INTO notes (id,user_id,content,ai_response) VALUES (?,?,?,?)').run(uuid(),user.userId,content,JSON.stringify(parsed));
      db.prepare('INSERT INTO daily_briefs (id,user_id,date,items) VALUES (?,?,?,?) ON CONFLICT(user_id,date) DO UPDATE SET items=?').run(uuid(),user.userId,today,JSON.stringify(parsed.items),JSON.stringify(parsed.items));
      return res.json(parsed);
    } catch(err) { return res.status(500).json({ error: 'AI failed', detail: err.message }); }
  }
  if (action === 'daily-brief') {
    const brief = db.prepare('SELECT * FROM daily_briefs WHERE user_id=? AND date=?').get(user.userId, today);
    if (brief) return res.json({ items: JSON.parse(brief.items), date: today });
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6', max_tokens: 512,
        messages: [{ role: 'user', content: `Daily brief for goals: ${goals.join(', ')}. People: ${people.join(', ')}. Today: ${today}. Return JSON: {"items":[{"priority":1,"title":"...","reason":"...","category":"goal"}],"summary":"..."}. Max 5 items.` }],
      });
      const text = message.content[0].text;
      let parsed;
      try { const m = text.match(/\{[\s\S]*\}/); parsed = JSON.parse(m ? m[0] : text); }
      catch { parsed = { items: [{ priority: 1, title: 'Start your day', reason: 'Review your goals', category: 'goal' }], summary: 'Make today count.' }; }
      db.prepare('INSERT OR REPLACE INTO daily_briefs (id,user_id,date,items) VALUES (?,?,?,?)').run(uuid(),user.userId,today,JSON.stringify(parsed.items));
      return res.json({ ...parsed, date: today });
    } catch { return res.json({ items: [{ priority: 1, title: 'Set up your Life Profile', reason: 'Add goals to get AI-powered briefs', category: 'goal' }], summary: 'Complete your setup.', date: today }); }
  }
  return res.status(400).json({ error: 'Unknown action' });
}
