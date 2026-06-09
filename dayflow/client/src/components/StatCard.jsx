export default function StatCard({ label, value, sub, color = 'text-accent' }) {
  return (
    <div className="bg-card rounded-xl p-5 border border-slate-800 hover:border-slate-600 transition-colors">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}
