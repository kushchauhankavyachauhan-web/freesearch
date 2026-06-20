"use client";
import Link from 'next/link';
import { useStore } from '../../lib/store.js';
import { Card, EmptyState, SectionHeader, MintButton, PointsChip } from '../../components/ui.jsx';

export default function HistoryPage() {
  const { state } = useStore();
  const { recyclingHistory } = state;

  if (!recyclingHistory.length) {
    return (
      <div className="min-h-screen bg-bg py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <SectionHeader label="Layer 4" title="Recycling History" sub="Verified EPR disposal records appear here." />
          <EmptyState
            icon="📋"
            title="No records yet"
            sub="Log unusable components from a device scan to generate verified EPR records."
            action={<Link href="/scan"><MintButton>Scan a Device →</MintButton></Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <SectionHeader
              label="Layer 4 — EPR Compliance"
              title="Verified Recycling History"
              sub={`${recyclingHistory.length} record${recyclingHistory.length !== 1 ? 's' : ''} · fraud-proof, timestamp-anchored`}
            />
          </div>
          <div className="flex gap-3 items-start">
            <PointsChip pts={30} />
            <button
              onClick={() => alert('Mock: Downloading compliance report as CSV...\n\nIn a production build this generates a signed PDF with all records, timestamps, and geo-tags for ESG filing.')}
              className="px-4 py-2 bg-navy text-white text-sm font-bold rounded-xl hover:bg-navy-light transition-all"
            >
              ↓ Download Report
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Records', value: recyclingHistory.length, icon: '📋' },
            { label: 'Brands Covered', value: [...new Set(recyclingHistory.map(r=>r.brandName))].length, icon: '🏭' },
            { label: 'EPR Categories', value: [...new Set(recyclingHistory.map(r=>r.eprCategory))].length, icon: '📂' },
            { label: 'Geo Tags', value: [...new Set(recyclingHistory.map(r=>r.geoTag))].length, icon: '📍' },
          ].map((s,i) => (
            <Card key={i} className="p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black text-navy">{s.value}</div>
              <div className="text-xs text-navy/45 mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Records table */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-navy/8 flex items-center justify-between">
            <h3 className="font-bold text-navy">Verified Records Log</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-navy/50 font-semibold">Live</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg text-xs font-bold text-navy/40 uppercase tracking-wider border-b border-navy/8">
                  <th className="px-5 py-3 text-left">Record ID</th>
                  <th className="px-5 py-3 text-left">Component</th>
                  <th className="px-5 py-3 text-left">Device</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">EPR Category</th>
                  <th className="px-5 py-3 text-left hidden lg:table-cell">Geo Tag</th>
                  <th className="px-5 py-3 text-left">Timestamp</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recyclingHistory.map((rec, i) => (
                  <tr key={rec.id} className={`border-t border-navy/5 hover:bg-mint/3 ${i % 2 === 0 ? 'bg-white' : 'bg-bg/50'}`}>
                    <td className="px-5 py-4 font-mono text-xs text-navy font-bold">{rec.id}</td>
                    <td className="px-5 py-4 font-medium text-navy text-xs">{rec.component}</td>
                    <td className="px-5 py-4 text-navy/70 text-xs max-w-[140px] truncate">{rec.deviceName}</td>
                    <td className="px-5 py-4 text-navy/60 text-xs hidden md:table-cell max-w-[160px] truncate">{rec.eprCategory}</td>
                    <td className="px-5 py-4 text-navy/55 text-xs hidden lg:table-cell">{rec.geoTag}</td>
                    <td className="px-5 py-4 text-navy/50 text-xs whitespace-nowrap">{new Date(rec.timestamp).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
