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
    db.prepare('INSERT INTO focus_sessions (id,user_id,duration_minutes,date) VALUES (?,?,?,?)').run(uuid(),user.userId,duration_minutes,new Date().toISOString().split('T')[0]);
    return res.status(201).json({ success: true });
  }
  if (req.method === 'GET') {
    const days = parseInt(req.query.days||7);
    return res.json(db.prepare(`SELECT date, SUM(duration_minutes) as total_minutes FROM focus_sessions WHERE user_id=? AND date >= date('now','-${days} days') GROUP BY date ORDER BY date ASC`).all(user.userId));
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
