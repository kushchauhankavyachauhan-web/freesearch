import React from 'react';

export default function SopDocument({ sop }) {
  return (
    <div className="card p-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-1 bg-accent/20 text-accent-light text-xs font-semibold rounded-full border border-accent/30">
                {sop.sopId}
              </span>
              <span className="px-2.5 py-1 bg-surface-2 text-muted text-xs rounded-full border border-border">
                v{sop.version}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{sop.title}</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          {[
            { label: 'Department', value: sop.department },
            { label: 'Owner', value: sop.owner },
            { label: 'Frequency', value: sop.frequency },
            { label: 'Duration', value: sop.duration },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-2 rounded-lg p-3 border border-border">
              <p className="text-xs text-muted font-medium uppercase tracking-wide mb-1">{label}</p>
              <p className="text-sm text-gray-200 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Purpose & Scope */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Section title="Purpose">
          <p className="text-gray-300 text-sm leading-relaxed">{sop.purpose}</p>
        </Section>
        <Section title="Scope">
          <p className="text-gray-300 text-sm leading-relaxed">{sop.scope}</p>
        </Section>
      </div>

      {/* Steps */}
      <Section title="Procedure Steps">
        <div className="space-y-4">
          {sop.steps?.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-light text-sm font-bold">
                {i + 1}
              </div>
              <div className="flex-1 bg-surface-2 rounded-lg p-4 border border-border">
                <h4 className="font-semibold text-white text-sm mb-1">{step.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <PersonIcon />
                  <span className="text-xs text-muted">{step.responsible}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Warnings */}
      {sop.warnings?.length > 0 && (
        <Section title="Warnings">
          <div className="space-y-2">
            {sop.warnings.map((w, i) => (
              <div key={i} className="flex gap-2.5 p-3 bg-yellow-500/10 border border-yellow-500/25 rounded-lg">
                <span className="text-yellow-400 flex-shrink-0">⚠</span>
                <p className="text-yellow-200/80 text-sm">{w}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Notes */}
      {sop.notes?.length > 0 && (
        <Section title="Notes">
          <ul className="space-y-2">
            {sop.notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-400">
                <span className="text-accent-light mt-0.5">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Success Criteria */}
      <Section title="Success Criteria">
        <div className="flex gap-2.5 p-4 bg-green-500/10 border border-green-500/25 rounded-lg">
          <span className="text-green-400 flex-shrink-0">✓</span>
          <p className="text-green-200/80 text-sm">{sop.successCriteria}</p>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="flex-1 h-px bg-border" />
        {title}
        <span className="flex-1 h-px bg-border" />
      </h3>
      {children}
    </div>
  );
}

function PersonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
