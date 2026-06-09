import { useEffect, useState } from 'react'
import * as api from '../api'

const STATUS_STYLES = {
  pending: 'border-slate-700',
  achieved: 'border-green-500/40 bg-green-500/5',
  carried: 'border-yellow-500/40 bg-yellow-500/5',
}

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [text, setText] = useState('')
  const date = api.today()

  useEffect(() => { api.getGoals(date).then(setGoals) }, [])

  const add = async (e) => {
    e.preventDefault()
    if (!text.trim() || goals.length >= 3) return
    const g = await api.addGoal(text.trim(), date)
    setGoals(prev => [...prev, g])
    setText('')
  }

  const setStatus = async (id, status) => {
    const updated = await api.updateGoal(id, status)
    setGoals(prev => prev.map(g => g.id === id ? updated : g))
  }

  const remove = async (id) => {
    await api.deleteGoal(id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Daily Goals</h1>
        <p className="text-slate-500 text-sm mt-1">Set up to 3 goals for today</p>
      </div>

      {goals.length < 3 && (
        <form onSubmit={add} className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="What's your goal for today?"
            className="flex-1 bg-card border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-accent" />
          <button type="submit" className="px-5 py-2.5 bg-accent hover:bg-accent-dim rounded-lg text-sm font-semibold text-white transition-colors">+ Add</button>
        </form>
      )}

      <div className="space-y-3">
        {goals.length === 0 && (
          <div className="text-center py-12 text-slate-600">No goals set for today. Add up to 3.</div>
        )}
        {goals.map((g, i) => (
          <div key={g.id} className={`bg-card rounded-xl px-5 py-4 border transition-all ${STATUS_STYLES[g.status] || STATUS_STYLES.pending}`}>
            <div className="flex items-start gap-3">
              <span className="text-slate-600 font-bold text-sm mt-0.5">{i + 1}</span>
              <p className={`flex-1 text-sm ${g.status === 'achieved' ? 'line-through text-slate-500' : 'text-white'}`}>{g.text}</p>
              <button onClick={() => remove(g.id)} className="text-slate-700 hover:text-red-400 transition-colors text-lg leading-none">×</button>
            </div>
            {g.status === 'pending' && (
              <div className="flex gap-2 mt-3 ml-6">
                <button onClick={() => setStatus(g.id, 'achieved')}
                  className="px-3 py-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors font-medium">
                  ✓ Achieved
                </button>
                <button onClick={() => setStatus(g.id, 'carried')}
                  className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg transition-colors font-medium">
                  → Carry Forward
                </button>
              </div>
            )}
            {g.status === 'achieved' && <p className="text-xs text-green-400 mt-2 ml-6">✓ Achieved today!</p>}
            {g.status === 'carried' && <p className="text-xs text-yellow-400 mt-2 ml-6">→ Carried forward</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
