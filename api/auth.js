import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { getDb } from './_db.js';
import { signToken, setCors } from './_middleware.js';
export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { action } = req.query;
  if (action === 'signup') return signup(req, res);
  if (action === 'login') return login(req, res);
  return res.status(404).json({ error: 'Not found' });
}
function signup(req, res) {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });
  const db = getDb();
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) return res.status(409).json({ error: 'Email already registered' });
  const id = uuid();
  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(id, email, bcrypt.hashSync(password, 10), name);
  db.prepare('INSERT INTO life_profiles (id, user_id) VALUES (?, ?)').run(uuid(), id);
  const token = signToken({ userId: id, email, name });
  return res.status(201).json({ token, user: { id, email, name } });
}
function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
  return res.json({ token: signToken({ userId: user.id, email: user.email, name: user.name }), user: { id: user.id, email: user.email, name: user.name } });
}
