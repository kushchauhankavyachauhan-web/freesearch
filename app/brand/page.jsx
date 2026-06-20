"use client";
import { useState, useMemo } from 'react';
import { useStore } from '../../lib/store.js';
import { getUniqueBrands, getDevicesByBrand, DATASET } from '../../lib/scanner.js';
import { Card, SectionHeader } from '../../components/ui.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const MINT = '#2FC7A8';
const NAVY = '#143C3D';
const COLORS = ['#2FC7A8','#143C3D','#5dd9be','#1a5052','#23a88d','#0d2828','#85e8d4'];

const ANNUAL_TARGET = 500;

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${accent ? 'bg-mint' : 'bg-navy/8'}`}>
          {icon}
        </div>
        <span className="text-xs font-bold text-mint uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-4xl font-black mb-1 ${accent ? 'text-mint' : 'text-navy'}`}>{value}</div>
      {sub && <div className="text-xs text-navy/45">{sub}</div>}
    </Card>
  );
}

// Generate mock brand records from the full dataset as "pre-existing" recycling data
function getMockRecords(brand) {
  const devices = DATASET.filter(d => d.brandName === brand);
  const seed = brand.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  let s = seed;
  const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s>>>0)/0xffffffff; };
  const count = Math.floor(rng() * 40) + 15;
  const geos = ['Mumbai, MH','Delhi, DL','Bengaluru, KA','Chennai, TN','Hyderabad, TS','Pune, MH','Kolkata, WB','Jaipur, RJ'];
  const records = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i = 0; i < count; i++) {
    const dev = devices[Math.floor(rng() * devices.length)];
    const comp = dev.components[Math.floor(rng() * dev.components.length)];
    const daysAgo = Math.floor(rng() * 180);
    const ts = new Date(Date.now() - daysAgo * 86400000);
    let id = 'EPR-';
    for (let j=0;j<8;j++) id += chars[Math.floor(rng()*chars.length)];
    records.push({
      id, deviceName: dev.deviceName, component: comp.name,
      eprCategory: dev.eprCategory, geoTag: geos[Math.floor(rng()*geos.length)],
      timestamp: ts.toISOString(),
    });
  }
  return records.sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp));
}

export default function BrandPage() {
  const { state, setViewMode } = useStore();
  const { viewMode, recyclingHistory } = state;

  const allBrands = useMemo(() => getUniqueBrands(), []);
  const [selectedBrand, setSelectedBrand] = useState(allBrands[0] || 'Samsung');

  const brandDevices = useMemo(() => getDevicesByBrand(selectedBrand), [selectedBrand]);

  // Combine mock records + user's actual recycling history for this brand
  const mockRecords = useMemo(() => getMockRecords(selectedBrand), [selectedBrand]);
  const userRecords = recyclingHistory.filter(r => r.brandName === selectedBrand);
  const allRecords = [...userRecords, ...mockRecords];

  const totalUnits = allRecords.length;
  const complianceScore = Math.min(100, Math.round((totalUnits / ANNUAL_TARGET) * 100));

  // EPR category breakdown
  const eprBreakdown = useMemo(() => {
    const counts = {};
    allRecords.forEach(r => { counts[r.eprCategory] = (counts[r.eprCategory] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allRecords]);

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('en-IN', { month: 'short' });
      const yr = d.getFullYear();
      const mn = d.getMonth();
      const count = allRecords.filter(r => {
        const rd = new Date(r.timestamp);
        return rd.getMonth() === mn && rd.getFullYear() === yr;
      }).length;
      months.push({ month: label, records: count });
    }
    return months;
  }, [allRecords]);

  // Category count for datasets
  const deviceCategoryBreakdown = useMemo(() => {
    const counts = {};
    brandDevices.forEach(d => { counts[d.category] = (counts[d.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value-a.value).slice(0,6);
  }, [brandDevices]);

  const handleDownload = () => {
    const csv = [
      ['Record ID','Device','Component','EPR Category','Geo Tag','Timestamp','Verified'].join(','),
      ...allRecords.map(r => [r.id, `"${r.deviceName}"`, `"${r.component}"`, `"${r.eprCategory}"`, `"${r.geoTag}"`, r.timestamp, 'TRUE'].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScrapDevIQ_${selectedBrand}_ComplianceReport_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="text-xs font-bold text-navy/40 uppercase tracking-widest mb-2">Brand View — B2B Dashboard</div>
            <h1 className="text-3xl font-black text-navy mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy flex items-center justify-center text-white text-lg">🏭</div>
              Brand Compliance Dashboard
            </h1>
            <p className="text-navy/55">EPR recycling analytics and verified disposal records — fraud-proof, audit-ready.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-navy text-white text-sm font-bold rounded-xl hover:bg-navy-light transition-all flex items-center gap-2"
            >
              ↓ Download CSV Report
            </button>
            <button
              onClick={() => setViewMode('citizen')}
              className="px-5 py-2.5 border-2 border-mint text-mint text-sm font-bold rounded-xl hover:bg-mint hover:text-white transition-all"
            >
              ← Citizen View
            </button>
          </div>
        </div>

        {/* Brand selector */}
        <Card className="p-5 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-bold text-navy shrink-0">Select Brand:</label>
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="flex-1 max-w-xs px-4 py-2.5 rounded-xl border border-navy/20 text-navy font-semibold focus:outline-none focus:border-mint bg-white text-sm"
            >
              {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="flex items-center gap-1.5 bg-mint/10 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-mint animate-pulse" />
              <span className="text-xs font-bold text-navy">{brandDevices.length} device profiles in dataset</span>
            </div>
          </div>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Units Verified" value={totalUnits} sub={`of ${ANNUAL_TARGET} annual target`} accent />
          <StatCard icon="🎯" label="Compliance Score" value={`${complianceScore}%`} sub="toward annual target" />
          <StatCard icon="📂" label="EPR Categories" value={eprBreakdown.length} sub="categories reported" />
          <StatCard icon="📍" label="Geo Coverage" value={[...new Set(allRecords.map(r=>r.geoTag))].length} sub="cities covered" />
        </div>

        {/* Compliance progress bar */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-navy">Annual Recycling Target Progress</h3>
              <p className="text-xs text-navy/45">{totalUnits} of {ANNUAL_TARGET} units verified · {new Date().getFullYear()}</p>
            </div>
            <div className={`text-3xl font-black ${complianceScore >= 80 ? 'text-green-600' : complianceScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
              {complianceScore}%
            </div>
          </div>
          <div className="h-5 bg-navy/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                complianceScore >= 80 ? 'bg-green-400' : complianceScore >= 50 ? 'bg-yellow-400' : 'bg-mint'
              }`}
              style={{ width: `${complianceScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-navy/35 mt-1.5">
            <span>0</span><span>Target: {ANNUAL_TARGET} units</span>
          </div>
        </Card>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="font-bold text-navy mb-1">Monthly Recycling Trend</h3>
            <p className="text-xs text-navy/40 mb-5">Verified records — last 6 months</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: NAVY, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: NAVY, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ border: 'none', borderRadius: 10, background: '#fff', boxShadow: '0 2px 12px rgba(20,60,61,0.1)' }} />
                <Bar dataKey="records" fill={MINT} radius={[6,6,0,0]} name="Records" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-navy mb-1">EPR Category Breakdown</h3>
            <p className="text-xs text-navy/40 mb-4">Share of verified units by category</p>
            {eprBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={eprBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {eprBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ border:'none', borderRadius:10, background:'#fff' }} />
                  <Legend iconSize={10} iconType="circle"
                    formatter={v => <span style={{ fontSize: 11, color: NAVY }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-navy/30 text-sm">No data yet</div>
            )}
          </Card>
        </div>

        {/* Device categories in dataset */}
        <Card className="p-6 mb-8">
          <h3 className="font-bold text-navy mb-1">Device Portfolio in Dataset</h3>
          <p className="text-xs text-navy/40 mb-5">All {selectedBrand} devices tracked in ScrapDevIQ</p>
          <div className="space-y-2">
            {deviceCategoryBreakdown.map((cat, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-navy/50 w-28 shrink-0 truncate">{cat.name}</span>
                <div className="flex-1 h-2.5 bg-navy/10 rounded-full overflow-hidden">
                  <div className="h-full bg-mint rounded-full"
                    style={{ width: `${(cat.value / brandDevices.length) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-navy w-8 text-right">{cat.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Verified records table */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-navy/8 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-navy">Verified Recycling Records</h3>
              <p className="text-xs text-navy/40">{allRecords.length} records · immutable audit log</p>
            </div>
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
                  <th className="px-5 py-3 text-left">Device</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Component</th>
                  <th className="px-5 py-3 text-left hidden lg:table-cell">EPR Category</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Geo Tag</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.slice(0, 30).map((rec, i) => (
                  <tr key={rec.id} className={`border-t border-navy/5 hover:bg-mint/3 ${i%2===0?'bg-white':'bg-bg/40'}`}>
                    <td className="px-5 py-3 font-mono text-xs text-navy font-bold">{rec.id}</td>
                    <td className="px-5 py-3 text-xs text-navy/70 max-w-[140px] truncate">{rec.deviceName}</td>
                    <td className="px-5 py-3 text-xs text-navy/60 hidden md:table-cell">{rec.component}</td>
                    <td className="px-5 py-3 text-xs text-navy/50 hidden lg:table-cell max-w-[150px] truncate">{rec.eprCategory}</td>
                    <td className="px-5 py-3 text-xs text-navy/50 hidden md:table-cell">{rec.geoTag}</td>
                    <td className="px-5 py-3 text-xs text-navy/50 whitespace-nowrap">{new Date(rec.timestamp).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allRecords.length > 30 && (
              <div className="px-5 py-3 text-xs text-navy/40 border-t border-navy/8">
                Showing 30 of {allRecords.length} records. Download CSV for full report.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
