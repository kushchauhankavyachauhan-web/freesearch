const LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'planner', label: 'Planner', icon: '✓' },
  { id: 'habits', label: 'Habits', icon: '↺' },
  { id: 'goals', label: 'Goals', icon: '◎' },
  { id: 'notes', label: 'Notes', icon: '✎' },
]

export default function Sidebar({ current, onNavigate }) {
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-card border-r border-slate-800 flex flex-col py-8 px-4 z-10">
      <div className="mb-10 px-2">
        <span className="text-2xl font-bold text-accent">DayFlow</span>
        <p className="text-xs text-slate-500 mt-1">Take control of your day.</p>
      </div>
      <nav className="flex flex-col gap-1">
        {LINKS.map(link => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left w-full
              ${current === link.id
                ? 'bg-accent text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
          >
            <span className="text-base w-5 text-center">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto px-2">
        <p className="text-xs text-slate-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>
    </aside>
  )
}
