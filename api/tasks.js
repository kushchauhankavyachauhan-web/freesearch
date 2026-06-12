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
    const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY priority DESC, created_at DESC').all(user.userId);
    return res.json(tasks);
  }

  if (req.method === 'POST') {
    const { title, description, priority, due_date } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });
    const id = uuid();
    db.prepare('INSERT INTO tasks (id, user_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, user.userId, title, description || null, priority || 0, due_date || null
    );
    return res.status(201).json({ id, title, description, priority, due_date });
  }

  if (req.method === 'PUT') {
    const { id, title, completed, priority } = req.body;
    db.prepare('UPDATE tasks SET title = ?, completed = ?, priority = ? WHERE id = ? AND user_id = ?').run(
      title, completed ? 1 : 0, priority, id, user.userId
    );
    return res.json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, user.userId);
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
