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
  const deepWorkStart = profile?.deep_work_start || '09:00';
  const deepWorkEnd = profile?.deep_work_end || '12:00';

  const today = new Date().toISOString().split('T')[0];

  if (action === 'filter') {
    const systemPrompt = `You are Lifen's AI filtering intelligence. Your job is to read content submitted by the user and determine what genuinely matters based on their Life Profile.

Life Profile:
- Goals: ${goals.length ? goals.join(', ') : 'Not set'}
- Priority People: ${people.length ? people.join(', ') : 'Not set'}
- Deep Work Time: ${deepWorkStart} - ${deepWorkEnd}

Analyze the submitted content and return ONLY what matters, ranked by priority. Be ruthless — filter out noise.

Return a JSON object like:
{
  "items": [
    { "priority": 1, "title": "Short action item or key info", "reason": "Why this matters", "category": "goal|person|urgent|opportunity" }
  ],
  "summary": "One sentence summary of what's most important today"
}

Maximum 5 items. If nothing in the content is relevant, return fewer items or say so in the summary.`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Filter this content:\n\n${content}` }],
      });

      const text = message.content[0].text;
      let parsed;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch {
        parsed = { items: [{ priority: 1, title: 'AI Response', reason: text, category: 'urgent' }], summary: 'AI processed your content.' };
      }

      // Save note and AI response
      const noteId = uuid();
      db.prepare('INSERT INTO notes (id, user_id, content, ai_response) VALUES (?, ?, ?, ?)').run(
        noteId, user.userId, content, JSON.stringify(parsed)
      );

      // Upsert daily brief
      const briefId = uuid();
      db.prepare(`
        INSERT INTO daily_briefs (id, user_id, date, items)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET items = ?
      `).run(briefId, user.userId, today, JSON.stringify(parsed.items), JSON.stringify(parsed.items));

      return res.json(parsed);
    } catch (err) {
      console.error('AI error:', err);
      return res.status(500).json({ error: 'AI processing failed', detail: err.message });
    }
  }

  if (action === 'daily-brief') {
    const brief = db.prepare('SELECT * FROM daily_briefs WHERE user_id = ? AND date = ?').get(user.userId, today);
    if (brief) {
      return res.json({ items: JSON.parse(brief.items), date: today });
    }

    // Generate fresh brief from goals
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `Generate a daily brief for someone with these goals: ${goals.join(', ')}. Priority people: ${people.join(', ')}. Today is ${today}.

Return JSON: { "items": [{ "priority": 1, "title": "...", "reason": "...", "category": "goal|person|urgent|opportunity" }], "summary": "..." }

Maximum 5 motivating, actionable items for their day.`
        }],
      });

      const text = message.content[0].text;
      let parsed;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch {
        parsed = { items: [{ priority: 1, title: 'Start your day with intention', reason: 'Review your goals and priorities', category: 'goal' }], summary: 'Make today count.' };
      }

      const briefId = uuid();
      db.prepare('INSERT OR REPLACE INTO daily_briefs (id, user_id, date, items) VALUES (?, ?, ?, ?)').run(
        briefId, user.userId, today, JSON.stringify(parsed.items)
      );

      return res.json({ ...parsed, date: today });
    } catch (err) {
      return res.json({
        items: [{ priority: 1, title: 'Set up your Life Profile', reason: 'Add goals and priority people to get personalized insights', category: 'goal' }],
        summary: 'Complete your setup to unlock AI-powered daily briefs.',
        date: today
      });
    }
  }

  return res.status(400).json({ error: 'Unknown action' });
}
