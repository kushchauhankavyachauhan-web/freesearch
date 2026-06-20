"use client";

export function StatusBadge({ status, className = '' }) {
  const map = {
    Healthy: 'bg-green-100 text-green-700 border-green-200',
    Aging: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Replace Soon': 'bg-red-100 text-red-700 border-red-200',
  };
  const dot = { Healthy: 'bg-green-500', Aging: 'bg-yellow-500', 'Replace Soon': 'bg-red-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status] || 'bg-gray-400'}`} />
      {status}
    </span>
  );
}

export function HazardBadge({ level, className = '' }) {
  const map = {
    Low: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${map[level] || 'bg-gray-100 text-gray-600'} ${className}`}>
      ⚠ {level} hazard
    </span>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-navy/8 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function IconCircle({ children, className = '' }) {
  return (
    <div className={`w-10 h-10 rounded-full bg-mint flex items-center justify-center text-white text-lg shrink-0 ${className}`}>
      {children}
    </div>
  );
}

export function MintButton({ onClick, children, className = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 bg-mint text-white font-bold rounded-xl hover:bg-mint-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm ${className}`}
    >
      {children}
    </button>
  );
}

export function NavyButton({ onClick, children, className = '', disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 bg-navy text-white font-bold rounded-xl hover:bg-navy-light transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm ${className}`}
    >
      {children}
    </button>
  );
}

export function SectionHeader({ label, title, sub }) {
  return (
    <div className="mb-8">
      {label && <div className="text-xs font-bold text-mint uppercase tracking-widest mb-2">{label}</div>}
      <h1 className="text-3xl font-black text-navy mb-2">{title}</h1>
      {sub && <p className="text-navy/60">{sub}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-6xl mb-4 opacity-30">{icon}</div>
      <p className="font-bold text-navy text-lg mb-1">{title}</p>
      {sub && <p className="text-navy/50 text-sm mb-6">{sub}</p>}
      {action}
    </div>
  );
}

export function PointsChip({ pts }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-mint/10 border border-mint/20 px-3 py-1 rounded-full">
      <span className="text-mint">⚡</span>
      <span className="font-bold text-navy text-sm">+{pts} pts</span>
    </div>
  );
}
