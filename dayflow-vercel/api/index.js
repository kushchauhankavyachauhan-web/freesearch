import { createClient } from '@libsql/client'

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

// Initialize tables once
async function initDB() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Other',
      priority TEXT NOT NULL DEFAULT 'Medium',
      time TEXT,
      date TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      UNIQUE(habit_id, date)
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL DEFAULT ''
    );
  `)
}

let initialized = false

export default async function handler(req, res) {
  if (!initialized) {
    await initDB()
    initialized = true
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = url.pathname.replace(/^\/api/, '')
  const method = req.method

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (method === 'OPTIONS') return res.status(200).end()

  try {
    // ── TASKS ──────────────────────────────────────────────
    if (path === '/tasks' && method === 'GET') {
      const date = url.searchParams.get('date')
      const sql = date
        ? 'SELECT * FROM tasks WHERE date = ? ORDER BY time ASC, id ASC'
        : 'SELECT * FROM tasks ORDER BY date DESC, id DESC'
      const r = await db.execute({ sql, args: date ? [date] : [] })
      return res.status(200).json(r.rows)
    }

    if (path === '/tasks' && method === 'POST') {
      const { name, category, priority, time, date } = req.body
      const r = await db.execute({
        sql: 'INSERT INTO tasks (name, category, priority, time, date) VALUES (?, ?, ?, ?, ?)',
        args: [name, category || 'Other', priority || 'Medium', time || null, date],
      })
      const row = await db.execute({ sql: 'SELECT * FROM tasks WHERE id = ?', args: [r.lastInsertRowid] })
      return res.status(200).json(row.rows[0])
    }

    if (path.match(/^\/tasks\/\d+$/) && method === 'PATCH') {
      const id = path.split('/')[2]
      const { done } = req.body
      await db.execute({ sql: 'UPDATE tasks SET done = ? WHERE id = ?', args: [done ? 1 : 0, id] })
      const row = await db.execute({ sql: 'SELECT * FROM tasks WHERE id = ?', args: [id] })
      return res.status(200).json(row.rows[0])
    }

    if (path.match(/^\/tasks\/\d+$/) && method === 'DELETE') {
      const id = path.split('/')[2]
      await db.execute({ sql: 'DELETE FROM tasks WHERE id = ?', args: [id] })
      return res.status(200).json({ ok: true })
    }

    // ── HABITS ─────────────────────────────────────────────
    if (path === '/habits' && method === 'GET') {
      const today = new Date().toISOString().slice(0, 10)
      const habits = (await db.execute('SELECT * FROM habits ORDER BY id ASC')).rows
      const result = await Promise.all(habits.map(async h => {
        const logs = (await db.execute({ sql: 'SELECT date FROM habit_logs WHERE habit_id = ? ORDER BY date DESC', args: [h.id] })).rows
        const doneToday = logs.some(l => l.date === today)
        let streak = 0
        const check = new Date()
        if (!doneToday) check.setDate(check.getDate() - 1)
        for (let i = 0; i < 365; i++) {
          const d = check.toISOString().slice(0, 10)
          if (logs.some(l => l.date === d)) { streak++; check.setDate(check.getDate() - 1) }
          else break
        }
        return { ...h, doneToday, streak }
      }))
      return res.status(200).json(result)
    }

    if (path === '/habits' && method === 'POST') {
      const { name } = req.body
      const r = await db.execute({ sql: 'INSERT INTO habits (name) VALUES (?)', args: [name] })
      return res.status(200).json({ id: Number(r.lastInsertRowid), name, doneToday: false, streak: 0 })
    }

    if (path.match(/^\/habits\/\d+$/) && method === 'DELETE') {
      const id = path.split('/')[2]
      await db.execute({ sql: 'DELETE FROM habits WHERE id = ?', args: [id] })
      await db.execute({ sql: 'DELETE FROM habit_logs WHERE habit_id = ?', args: [id] })
      return res.status(200).json({ ok: true })
    }

    if (path === '/habit_logs' && method === 'POST') {
      const { habit_id, date } = req.body
      try {
        await db.execute({ sql: 'INSERT INTO habit_logs (habit_id, date) VALUES (?, ?)', args: [habit_id, date] })
      } catch {}
      return res.status(200).json({ ok: true })
    }

    if (path === '/habit_logs' && method === 'DELETE') {
      const { habit_id, date } = req.body
      await db.execute({ sql: 'DELETE FROM habit_logs WHERE habit_id = ? AND date = ?', args: [habit_id, date] })
      return res.status(200).json({ ok: true })
    }

    // ── GOALS ──────────────────────────────────────────────
    if (path === '/goals' && method === 'GET') {
      const date = url.searchParams.get('date')
      const sql = date ? 'SELECT * FROM goals WHERE date = ? ORDER BY id ASC' : 'SELECT * FROM goals ORDER BY date DESC, id ASC'
      const r = await db.execute({ sql, args: date ? [date] : [] })
      return res.status(200).json(r.rows)
    }

    if (path === '/goals' && method === 'POST') {
      const { text, date } = req.body
      const r = await db.execute({ sql: 'INSERT INTO goals (text, date) VALUES (?, ?)', args: [text, date] })
      const row = await db.execute({ sql: 'SELECT * FROM goals WHERE id = ?', args: [r.lastInsertRowid] })
      return res.status(200).json(row.rows[0])
    }

    if (path.match(/^\/goals\/\d+$/) && method === 'PATCH') {
      const id = path.split('/')[2]
      const { status } = req.body
      await db.execute({ sql: 'UPDATE goals SET status = ? WHERE id = ?', args: [status, id] })
      const row = await db.execute({ sql: 'SELECT * FROM goals WHERE id = ?', args: [id] })
      return res.status(200).json(row.rows[0])
    }

    if (path.match(/^\/goals\/\d+$/) && method === 'DELETE') {
      const id = path.split('/')[2]
      await db.execute({ sql: 'DELETE FROM goals WHERE id = ?', args: [id] })
      return res.status(200).json({ ok: true })
    }

    // ── NOTES ──────────────────────────────────────────────
    if (path.match(/^\/notes\/.+$/) && method === 'GET') {
      const date = path.split('/')[2]
      const r = await db.execute({ sql: 'SELECT * FROM notes WHERE date = ?', args: [date] })
      return res.status(200).json(r.rows[0] || { date, content: '' })
    }

    if (path.match(/^\/notes\/.+$/) && method === 'PUT') {
      const date = path.split('/')[2]
      const { content } = req.body
      await db.execute({
        sql: 'INSERT INTO notes (date, content) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET content = excluded.content',
        args: [date, content],
      })
      return res.status(200).json({ ok: true })
    }

    // ── STATS ──────────────────────────────────────────────
    if (path === '/stats/today' && method === 'GET') {
      const today = new Date().toISOString().slice(0, 10)
      const tasks = (await db.execute({ sql: 'SELECT done FROM tasks WHERE date = ?', args: [today] })).rows
      const habits = (await db.execute('SELECT COUNT(*) as total FROM habits')).rows[0]
      const habitsDone = (await db.execute({ sql: 'SELECT COUNT(*) as done FROM habit_logs WHERE date = ?', args: [today] })).rows[0]
      const goals = (await db.execute({ sql: 'SELECT status FROM goals WHERE date = ?', args: [today] })).rows
      const allTimeDone = (await db.execute('SELECT COUNT(*) as cnt FROM tasks WHERE done = 1')).rows[0]
      return res.status(200).json({
        tasksTotal: tasks.length,
        tasksDone: tasks.filter(t => t.done).length,
        habitsTotal: Number(habits.total),
        habitsDone: Number(habitsDone.done),
        goalsTotal: goals.length,
        goalsAchieved: goals.filter(g => g.status === 'achieved').length,
        allTimeDone: Number(allTimeDone.cnt),
      })
    }

    if (path === '/stats/categories' && method === 'GET') {
      const today = new Date().toISOString().slice(0, 10)
      const r = await db.execute({ sql: 'SELECT category, COUNT(*) as count FROM tasks WHERE date = ? GROUP BY category', args: [today] })
      return res.status(200).json(r.rows)
    }

    if (path === '/stats/weekly' && method === 'GET') {
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const date = d.toISOString().slice(0, 10)
        const total = Number((await db.execute({ sql: 'SELECT COUNT(*) as cnt FROM tasks WHERE date = ?', args: [date] })).rows[0].cnt)
        const done = Number((await db.execute({ sql: 'SELECT COUNT(*) as cnt FROM tasks WHERE date = ? AND done = 1', args: [date] })).rows[0].cnt)
        days.push({ date, total, done, pending: total - done })
      }
      return res.status(200).json(days)
    }

    if (path === '/stats/habit-week' && method === 'GET') {
      const total = Number((await db.execute('SELECT COUNT(*) as cnt FROM habits')).rows[0].cnt)
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const date = d.toISOString().slice(0, 10)
        const done = Number((await db.execute({ sql: 'SELECT COUNT(*) as cnt FROM habit_logs WHERE date = ?', args: [date] })).rows[0].cnt)
        days.push({ date, done, total })
      }
      return res.status(200).json(days)
    }

    if (path === '/stats/heatmap' && method === 'GET') {
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i)
        const date = d.toISOString().slice(0, 10)
        const tasks = Number((await db.execute({ sql: 'SELECT COUNT(*) as cnt FROM tasks WHERE date = ? AND done = 1', args: [date] })).rows[0].cnt)
        const habits = Number((await db.execute({ sql: 'SELECT COUNT(*) as cnt FROM habit_logs WHERE date = ?', args: [date] })).rows[0].cnt)
        days.push({ date, intensity: tasks + habits })
      }
      return res.status(200).json(days)
    }

    return res.status(404).json({ error: 'Not found' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}
