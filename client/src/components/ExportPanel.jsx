import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { api } from '../utils/api';
import SopPDF from './SopPDF';

export default function ExportPanel({ sop }) {
  const [status, setStatus] = useState({});

  async function handleExport(type) {
    setStatus(s => ({ ...s, [type]: 'loading' }));
    try {
      if (type === 'notion') {
        const res = await api.exportNotion(sop);
        setStatus(s => ({ ...s, notion: 'success', notionUrl: res.url }));
      } else if (type === 'google') {
        const res = await api.exportGoogleDocs(sop);
        if (res.url) window.open(res.url, '_blank');
        setStatus(s => ({ ...s, google: 'success' }));
      }
    } catch (err) {
      setStatus(s => ({ ...s, [type]: 'error', [`${type}Error`]: err.message }));
    }
  }

  async function handleGoogleAuth() {
    try {
      const { authUrl } = await api.getGoogleAuthUrl();
      window.open(authUrl, '_blank', 'width=600,height=600');
    } catch (err) {
      setStatus(s => ({ ...s, google: 'error', googleError: err.message }));
    }
  }

  function copyText() {
    const text = sopToText(sop);
    navigator.clipboard.writeText(text).then(() => {
      setStatus(s => ({ ...s, copy: 'success' }));
      setTimeout(() => setStatus(s => ({ ...s, copy: null })), 2000);
    });
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <ExportIcon />
        Export Options
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* PDF */}
        <PDFDownloadLink document={<SopPDF sop={sop} />} fileName={`${sop.sopId}-${sop.title.replace(/\s+/g, '-')}.pdf`}>
          {({ loading }) => (
            <ExportButton
              icon="📄"
              label={loading ? 'Preparing...' : 'Download PDF'}
              status={loading ? 'loading' : null}
              disabled={loading}
            />
          )}
        </PDFDownloadLink>

        {/* Copy Text */}
        <ExportButton
          icon={status.copy === 'success' ? '✓' : '📋'}
          label={status.copy === 'success' ? 'Copied!' : 'Copy Text'}
          status={status.copy}
          onClick={copyText}
        />

        {/* Notion */}
        <div>
          <ExportButton
            icon="🔗"
            label={status.notion === 'loading' ? 'Exporting...' : 'Notion'}
            status={status.notion}
            disabled={status.notion === 'loading'}
            onClick={() => handleExport('notion')}
          />
          {status.notion === 'success' && status.notionUrl && (
            <a href={status.notionUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-light hover:underline mt-1 block text-center">
              Open in Notion →
            </a>
          )}
          {status.notion === 'error' && (
            <p className="text-xs text-red-400 mt-1 text-center">{status.notionError}</p>
          )}
        </div>

        {/* Google Docs */}
        <div>
          <ExportButton
            icon="📝"
            label={status.google === 'loading' ? 'Exporting...' : 'Google Docs'}
            status={status.google}
            disabled={status.google === 'loading'}
            onClick={() => handleExport('google')}
          />
          {status.google === 'error' && status.googleError?.includes('not authenticated') && (
            <button onClick={handleGoogleAuth} className="text-xs text-accent-light hover:underline mt-1 block w-full text-center">
              Connect Google →
            </button>
          )}
          {status.google === 'error' && !status.googleError?.includes('not authenticated') && (
            <p className="text-xs text-red-400 mt-1 text-center">{status.googleError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ExportButton({ icon, label, status, onClick, disabled }) {
  const isSuccess = status === 'success';
  const isLoading = status === 'loading';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200 text-sm font-medium
        ${isSuccess
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : 'bg-surface-2 border-border text-gray-300 hover:border-accent/50 hover:text-white hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs">{label}</span>
    </button>
  );
}

function ExportIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  );
}

function sopToText(sop) {
  const lines = [
    sop.title,
    '='.repeat(sop.title.length),
    '',
    `SOP ID: ${sop.sopId} | Version: ${sop.version} | Department: ${sop.department}`,
    `Owner: ${sop.owner} | Frequency: ${sop.frequency} | Duration: ${sop.duration}`,
    '',
    'PURPOSE',
    '-------',
    sop.purpose,
    '',
    'SCOPE',
    '-----',
    sop.scope,
    '',
    'STEPS',
    '-----',
  ];
  sop.steps?.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.title}`);
    lines.push(`   ${s.description}`);
    lines.push(`   Responsible: ${s.responsible}`);
    lines.push('');
  });
  if (sop.warnings?.length) {
    lines.push('WARNINGS', '--------');
    sop.warnings.forEach(w => lines.push(`⚠ ${w}`));
    lines.push('');
  }
  if (sop.notes?.length) {
    lines.push('NOTES', '-----');
    sop.notes.forEach(n => lines.push(`• ${n}`));
    lines.push('');
  }
  lines.push('SUCCESS CRITERIA', '----------------', sop.successCriteria);
  return lines.join('\n');
}
