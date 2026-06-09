import { useEffect, useState } from 'react'
import * as api from '../api'

const CATEGORIES = ['Work', 'Study', 'Health', 'Personal', 'Finance', 'Other']
const PRIORITIES = ['High', 'Medium', 'Low']
const PRIORITY_COLORS = { High: 'text-red-400 bg-red-400/10', Medium: 'text-yellow-400 bg-yellow-400/10', Low: 'text-green-400 bg-green-400/10' }

export default function Planner() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState({ name: '', category: 'Work', priority: 'Medium', time: '' })
  const date = api.today()

  const load = () => api.getTasks(date).then(setTasks)
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const t = await api.addTask({ ...form, date })
    setTasks(prev => [...prev, t])
    setForm({ name: '', category: 'Work', priority: 'Medium', time: '' })
  }

  const toggle = async (id, done) => {
    const updated = await api.toggleTask(id, !done)
    setTasks(prev => prev.map(t => t.id === id ? updated : t))
  }

  const remove = async (id) => {
    await api.deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const done = tasks.filter(t => t.done).length

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Planner</h1>
          <p className="text-slate-500 text-sm mt-1">{date} · {done}/{tasks.length} done</p>
        </div>
      </div>

      {/* Add task form */}
      <form onSubmit={submit} className="bg-card rounded-xl p-5 border border-slate-800 space-y-3">
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Task name..."
          className="w-full bg-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-accent"
        />
        <div className="grid grid-cols-3 gap-2">
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-accent">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-accent">
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
            className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:ring-1 focus:ring-accent" />
        </div>
        <button type="submit" className="w-full py-2.5 bg-accent hover:bg-accent-dim rounded-lg text-sm font-semibold text-white transition-colors">
          + Add Task
        </button>
      </form>

      {/* Task list */}
      <div className="space-y-2">
        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-600">No tasks for today yet. Add one above.</div>
        )}
        {tasks.map(t => (
          <div key={t.id} className={`bg-card rounded-xl px-4 py-3 border transition-all flex items-center gap-3
            ${t.done ? 'border-slate-800 opacity-50' : 'border-slate-700'}`}>
            <button onClick={() => toggle(t.id, t.done)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                ${t.done ? 'bg-accent border-accent' : 'border-slate-600 hover:border-accent'}`}>
              {t.done && <span className="text-white text-xs">✓</span>}
            </button>
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${t.done ? 'line-through text-slate-500' : 'text-white'}`}>{t.name}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-600">{t.category}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                {t.time && <span className="text-xs text-slate-600">{t.time}</span>}
              </div>
            </div>
            <button onClick={() => remove(t.id)} className="text-slate-700 hover:text-red-400 transition-colors text-lg leading-none">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
