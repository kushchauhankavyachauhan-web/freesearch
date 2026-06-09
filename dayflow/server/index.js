const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ── TASKS ────────────────────────────────────────────
app.get('/api/tasks', (req, res) => {
  const { date } = req.query;
  const rows = date
    ? db.prepare('SELECT * FROM tasks WHERE date = ? ORDER BY time ASC, id ASC').all(date)
    : db.prepare('SELECT * FROM tasks ORDER BY date DESC, id DESC').all();
  res.json(rows);
});

app.post('/api/tasks', (req, res) => {
  const { name, category, priority, time, date } = req.body;
  const result = db.prepare(
    'INSERT INTO tasks (name, category, priority, time, date) VALUES (?, ?, ?, ?, ?)'
  ).run(name, category || 'Other', priority || 'Medium', time || null, date);
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid));
});

app.patch('/api/tasks/:id', (req, res) => {
  const { done } = req.body;
  db.prepare('UPDATE tasks SET done = ? WHERE id = ?').run(done ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
});

app.delete('/api/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── HABITS ───────────────────────────────────────────
app.get('/api/habits', (req, res) => {
  const habits = db.prepare('SELECT * FROM habits ORDER BY id ASC').all();
  const today = new Date().toISOString().slice(0, 10);
  const result = habits.map(h => {
    const logs = db.prepare('SELECT date FROM habit_logs WHERE habit_id = ? ORDER BY date DESC').all(h.id);
    const doneToday = logs.some(l => l.date === today);
    // Calculate streak
    let streak = 0;
    let check = new Date();
    if (!doneToday) check.setDate(check.getDate() - 1);
    for (let i = 0; i < 365; i++) {
      const d = check.toISOString().slice(0, 10);
      if (logs.some(l => l.date === d)) {
        streak++;
        check.setDate(check.getDate() - 1);
      } else break;
    }
    return { ...h, doneToday, streak };
  });
  res.json(result);
});

app.post('/api/habits', (req, res) => {
  const { name } = req.body;
  const result = db.prepare('INSERT INTO habits (name) VALUES (?)').run(name);
  res.json({ id: result.lastInsertRowid, name, doneToday: false, streak: 0 });
});

app.delete('/api/habits/:id', (req, res) => {
  db.prepare('DELETE FROM habits WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/habit_logs', (req, res) => {
  const { habit_id, date } = req.body;
  try {
    db.prepare('INSERT INTO habit_logs (habit_id, date) VALUES (?, ?)').run(habit_id, date);
  } catch {}
  res.json({ ok: true });
});

app.delete('/api/habit_logs', (req, res) => {
  const { habit_id, date } = req.body;
  db.prepare('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?').run(habit_id, date);
  res.json({ ok: true });
});

// ── GOALS ────────────────────────────────────────────
app.get('/api/goals', (req, res) => {
  const { date } = req.query;
  const rows = date
    ? db.prepare('SELECT * FROM goals WHERE date = ? ORDER BY id ASC').all(date)
    : db.prepare('SELECT * FROM goals ORDER BY date DESC, id ASC').all();
  res.json(rows);
});

app.post('/api/goals', (req, res) => {
  const { text, date } = req.body;
  const result = db.prepare('INSERT INTO goals (text, date) VALUES (?, ?)').run(text, date);
  res.json(db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid));
});

app.patch('/api/goals/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE goals SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json(db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id));
});

app.delete('/api/goals/:id', (req, res) => {
  db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ── NOTES ────────────────────────────────────────────
app.get('/api/notes/:date', (req, res) => {
  const row = db.prepare('SELECT * FROM notes WHERE date = ?').get(req.params.date);
  res.json(row || { date: req.params.date, content: '' });
});

app.put('/api/notes/:date', (req, res) => {
  const { content } = req.body;
  db.prepare('INSERT INTO notes (date, content) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET content = excluded.content')
    .run(req.params.date, content);
  res.json({ ok: true });
});

// ── DASHBOARD STATS ───────────────────────────────────
app.get('/api/stats/today', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const tasks = db.prepare('SELECT done FROM tasks WHERE date = ?').all(today);
  const habits = db.prepare('SELECT COUNT(*) as total FROM habits').get();
  const habitsDone = db.prepare('SELECT COUNT(*) as done FROM habit_logs WHERE date = ?').get(today);
  const goals = db.prepare('SELECT status FROM goals WHERE date = ?').all(today);
  const allTimeDone = db.prepare('SELECT COUNT(*) as cnt FROM tasks WHERE done = 1').get();

  res.json({
    tasksTotal: tasks.length,
    tasksDone: tasks.filter(t => t.done).length,
    habitsTotal: habits.total,
    habitsDone: habitsDone.done,
    goalsTotal: goals.length,
    goalsAchieved: goals.filter(g => g.status === 'achieved').length,
    allTimeDone: allTimeDone.cnt,
  });
});

app.get('/api/stats/categories', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const rows = db.prepare(
    'SELECT category, COUNT(*) as count FROM tasks WHERE date = ? GROUP BY category'
  ).all(today);
  res.json(rows);
});

app.get('/api/stats/weekly', (req, res) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const total = db.prepare('SELECT COUNT(*) as cnt FROM tasks WHERE date = ?').get(date).cnt;
    const done = db.prepare('SELECT COUNT(*) as cnt FROM tasks WHERE date = ? AND done = 1').get(date).cnt;
    days.push({ date, total, done, pending: total - done });
  }
  res.json(days);
});

app.get('/api/stats/habit-week', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as cnt FROM habits').get().cnt;
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const done = db.prepare('SELECT COUNT(*) as cnt FROM habit_logs WHERE date = ?').get(date).cnt;
    days.push({ date, done, total });
  }
  res.json(days);
});

app.get('/api/stats/heatmap', (req, res) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const tasks = db.prepare('SELECT COUNT(*) as cnt FROM tasks WHERE date = ? AND done = 1').get(date).cnt;
    const habits = db.prepare('SELECT COUNT(*) as cnt FROM habit_logs WHERE date = ?').get(date).cnt;
    days.push({ date, intensity: tasks + habits });
  }
  res.json(days);
});

app.listen(3001, () => console.log('DayFlow API running on http://localhost:3001'));
