import { v4 as uuid } from 'uuid';
import { getDb } from './_db.js';
import { authenticate, setCors } from './_middleware.js';

export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = authenticate(req, res);
  if (!user) return;

  const db = getDb();

  if (req.method === 'POST') {
    const { duration_minutes } = req.body;
    const id = uuid();
    const today = new Date().toISOString().split('T')[0];
    db.prepare('INSERT INTO focus_sessions (id, user_id, duration_minutes, date) VALUES (?, ?, ?, ?)').run(
      id, user.userId, duration_minutes, today
    );
    return res.status(201).json({ success: true });
  }

  if (req.method === 'GET') {
    const { days = 7 } = req.query;
    const sessions = db.prepare(`
      SELECT date, SUM(duration_minutes) as total_minutes
      FROM focus_sessions
      WHERE user_id = ? AND date >= date('now', '-${parseInt(days)} days')
      GROUP BY date
      ORDER BY date ASC
    `).all(user.userId);
    return res.json(sessions);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
