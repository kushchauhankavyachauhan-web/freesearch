import { useEffect, useState } from 'react'
import * as api from '../api'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [name, setName] = useState('')
  const date = api.today()

  const load = () => api.getHabits().then(setHabits)
  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const h = await api.addHabit(name.trim())
    setHabits(prev => [...prev, h])
    setName('')
  }

  const toggle = async (h) => {
    if (h.doneToday) {
      await api.unlogHabit(h.id, date)
    } else {
      await api.logHabit(h.id, date)
    }
    load()
  }

  const remove = async (id) => {
    await api.deleteHabit(id)
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  const doneCount = habits.filter(h => h.doneToday).length

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Habits</h1>
        <p className="text-slate-500 text-sm mt-1">{doneCount}/{habits.length} done today</p>
      </div>

      <form onSubmit={add} className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New habit name..."
          className="flex-1 bg-card border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-accent" />
        <button type="submit" className="px-5 py-2.5 bg-accent hover:bg-accent-dim rounded-lg text-sm font-semibold text-white transition-colors">+ Add</button>
      </form>

      <div className="space-y-3">
        {habits.length === 0 && (
          <div className="text-center py-12 text-slate-600">No habits yet. Add your first one above.</div>
        )}
        {habits.map(h => (
          <div key={h.id} className={`bg-card rounded-xl px-5 py-4 border transition-all flex items-center gap-4
            ${h.doneToday ? 'border-accent/40 bg-accent/5' : 'border-slate-800'}`}>
            <button onClick={() => toggle(h)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                ${h.doneToday ? 'bg-accent border-accent scale-110' : 'border-slate-600 hover:border-accent'}`}>
              {h.doneToday && <span className="text-white text-xs">✓</span>}
            </button>
            <div className="flex-1">
              <p className={`text-sm font-medium ${h.doneToday ? 'text-white' : 'text-slate-300'}`}>{h.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-amber-400">🔥 {h.streak} day streak</span>
                {h.doneToday && <span className="text-xs text-accent">✓ Done today</span>}
              </div>
            </div>
            <button onClick={() => remove(h.id)} className="text-slate-700 hover:text-red-400 transition-colors text-lg">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
