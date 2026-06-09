import { useEffect, useState, useRef } from 'react'
import * as api from '../api'

export default function Notes() {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(true)
  const debounce = useRef(null)
  const date = api.today()

  useEffect(() => {
    api.getNote(date).then(n => setContent(n.content || ''))
  }, [])

  const onChange = (val) => {
    setContent(val)
    setSaved(false)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      await api.saveNote(date, val)
      setSaved(true)
    }, 600)
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notes</h1>
          <p className="text-slate-500 text-sm mt-1">Brain dump for {date}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${saved ? 'text-green-400 bg-green-400/10' : 'text-slate-500 bg-slate-800'}`}>
          {saved ? '✓ Saved' : 'Saving...'}
        </span>
      </div>
      <textarea
        value={content}
        onChange={e => onChange(e.target.value)}
        placeholder="Dump your thoughts here... ideas, reminders, anything on your mind today."
        className="w-full h-[60vh] bg-card border border-slate-800 focus:border-slate-600 rounded-xl p-5 text-sm text-slate-200 placeholder-slate-600 resize-none outline-none transition-colors leading-relaxed"
      />
    </div>
  )
}
