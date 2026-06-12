import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'lifen-dev-secret';
export function authenticate(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  try { return jwt.verify(auth.slice(7), JWT_SECRET); }
  catch { res.status(401).json({ error: 'Invalid token' }); return null; }
}
export function signToken(payload) { return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }); }
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}
