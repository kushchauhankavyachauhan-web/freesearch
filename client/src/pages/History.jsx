import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function History() {
  const navigate = useNavigate();
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.getHistory()
      .then(setSops)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!confirm('Delete this SOP?')) return;
    setDeleting(id);
    try {
      await api.deleteSop(id);
      setSops(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-muted">
      <SpinnerIcon /> Loading history...
    </div>
  );

  if (error) return (
    <div className="text-center py-32 text-red-400">{error}</div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">SOP History</h1>
          <p className="text-muted text-sm mt-1">{sops.length} document{sops.length !== 1 ? 's' : ''} generated</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-primary text-sm">
          + New SOP
        </button>
      </div>

      {sops.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3">
          {sops.map(sop => (
            <div
              key={sop.id}
              onClick={() => navigate(`/sop/${sop.id}`)}
              className="card p-5 cursor-pointer hover:border-accent/40 transition-all duration-200 group flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/30 transition-colors">
                <DocIcon />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-accent-light bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                    {sop.sop_id}
                  </span>
                  {sop.version && (
                    <span className="text-xs text-muted">v{sop.version}</span>
                  )}
                </div>
                <h3 className="font-semibold text-white truncate">{sop.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  {sop.department && <span className="text-xs text-muted">{sop.department}</span>}
                  {sop.owner && <span className="text-xs text-muted">· {sop.owner}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-muted">{formatDate(sop.created_at)}</span>
                <button
                  onClick={(e) => handleDelete(e, sop.id)}
                  disabled={deleting === sop.id}
                  className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                >
                  <TrashIcon />
                </button>
                <ChevronIcon />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="text-center py-24">
      <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
        <DocIcon size={28} className="text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No SOPs yet</h3>
      <p className="text-muted text-sm mb-6">Generate your first SOP from voice or text input</p>
      <button onClick={() => navigate('/')} className="btn-primary">Generate my first SOP</button>
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SpinnerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin mr-2">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
    </svg>
  );
}

function DocIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-light">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
