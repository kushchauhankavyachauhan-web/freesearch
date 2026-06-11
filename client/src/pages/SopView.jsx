import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import SopDocument from '../components/SopDocument';
import ExportPanel from '../components/ExportPanel';

export default function SopView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sop, setSop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getSop(id)
      .then(row => setSop(row.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-muted">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin mr-2">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
      </svg>
      Loading SOP...
    </div>
  );

  if (error) return (
    <div className="text-center py-32">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={() => navigate('/history')} className="btn-ghost">← Back to History</button>
    </div>
  );

  if (!sop) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/history')} className="flex items-center gap-1.5 text-muted hover:text-white text-sm transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to History
        </button>
        <button onClick={() => navigate('/')} className="btn-primary text-sm">+ New SOP</button>
      </div>

      <ExportPanel sop={sop} />
      <SopDocument sop={sop} />
    </div>
  );
}
