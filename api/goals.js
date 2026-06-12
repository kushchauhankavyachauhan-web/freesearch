import { v4 as uuid } from 'uuid';
import { getDb } from './_db.js';
import { authenticate, setCors } from './_middleware.js';

export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = authenticate(req, res);
  if (!user) return;

  const db = getDb();

  if (req.method === 'GET') {
    const goals = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at ASC').all(user.userId);
    return res.json(goals);
  }

  if (req.method === 'POST') {
    const { title, target, unit, color } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const id = uuid();
    db.prepare('INSERT INTO goals (id, user_id, title, target, unit, color) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, user.userId, title, target || 100, unit || '%', color || '#4F46E5'
    );
    return res.status(201).json({ id, title, target, unit, color, current: 0 });
  }

  if (req.method === 'PUT') {
    const { id, current, title } = req.body;
    db.prepare('UPDATE goals SET current = ?, title = ? WHERE id = ? AND user_id = ?').run(current, title, id, user.userId);
    return res.json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?').run(id, user.userId);
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
