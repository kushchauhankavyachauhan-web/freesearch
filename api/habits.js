import { v4 as uuid } from 'uuid';
import { getDb } from './_db.js';
import { authenticate, setCors } from './_middleware.js';

export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = authenticate(req, res);
  if (!user) return;

  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  if (req.method === 'GET') {
    const habits = db.prepare('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC').all(user.userId);
    const logs = db.prepare('SELECT habit_id FROM habit_logs WHERE user_id = ? AND completed_date = ?').all(user.userId, today);
    const completedToday = new Set(logs.map(l => l.habit_id));
    return res.json(habits.map(h => ({ ...h, completedToday: completedToday.has(h.id) })));
  }

  if (req.method === 'POST') {
    const { action, habitId, name, icon, color } = req.body;

    if (action === 'toggle') {
      const existing = db.prepare('SELECT id FROM habit_logs WHERE habit_id = ? AND completed_date = ?').get(habitId, today);
      if (existing) {
        db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND completed_date = ?').run(habitId, today);
      } else {
        const logId = uuid();
        db.prepare('INSERT INTO habit_logs (id, habit_id, user_id, completed_date) VALUES (?, ?, ?, ?)').run(logId, habitId, user.userId, today);
      }
      return res.json({ success: true, completed: !existing });
    }

    if (action === 'create') {
      const id = uuid();
      db.prepare('INSERT INTO habits (id, user_id, name, icon, color) VALUES (?, ?, ?, ?, ?)').run(
        id, user.userId, name, icon || '✓', color || '#4F46E5'
      );
      return res.status(201).json({ id, name, icon, color, completedToday: false });
    }

    if (action === 'delete') {
      db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(habitId, user.userId);
      return res.json({ success: true });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
