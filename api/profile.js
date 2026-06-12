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
    const profile = db.prepare('SELECT * FROM life_profiles WHERE user_id = ?').get(user.userId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    return res.json({
      ...profile,
      goals: JSON.parse(profile.goals || '[]'),
      priority_people: JSON.parse(profile.priority_people || '[]'),
    });
  }

  if (req.method === 'PUT') {
    const { goals, priority_people, deep_work_start, deep_work_end } = req.body;
    db.prepare(`
      UPDATE life_profiles SET
        goals = ?,
        priority_people = ?,
        deep_work_start = ?,
        deep_work_end = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      JSON.stringify(goals || []),
      JSON.stringify(priority_people || []),
      deep_work_start || '09:00',
      deep_work_end || '12:00',
      user.userId
    );
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
