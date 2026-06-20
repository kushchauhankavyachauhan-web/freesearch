import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const INITIAL_DEVICES = [
  { id: 1, name: 'Laptop (Dell XPS)', status: 'Recycled', kg: 2.2, co2: 48.4, metals: 0.12 },
  { id: 2, name: 'Smartphone (iPhone 12)', status: 'Resold', kg: 0.17, co2: 70, metals: 0.014 },
  { id: 3, name: 'Monitor (24")', status: 'Recycled', kg: 3.8, co2: 56, metals: 0.19 },
];

const MONTHLY_DATA = [
  { month: 'Jan', devices: 1, co2: 48 },
  { month: 'Feb', devices: 2, co2: 118 },
  { month: 'Mar', devices: 1, co2: 56 },
  { month: 'Apr', devices: 3, co2: 174 },
  { month: 'May', devices: 2, co2: 140 },
  { month: 'Jun', devices: 4, co2: 195 },
];

const STATUS_DOT = {
  Recycled: 'bg-mint',
  Resold: 'bg-navy',
  Pending: 'bg-yellow-400',
};

function StatCard({ value, unit, label, icon, accent }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-bold text-mint uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-4xl font-black ${accent || 'text-navy'}`}>{value}</span>
        <span className="text-navy/50 mb-1 text-sm">{unit}</span>
      </div>
    </div>
  );
}

export default function ImpactDashboard() {
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [showAdd, setShowAdd] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', status: 'Recycled', kg: '' });

  const totalCO2 = devices.reduce((s, d) => s + d.co2, 0).toFixed(1);
  const totalKg = devices.reduce((s, d) => s + d.kg, 0).toFixed(1);
  const totalMetals = devices.reduce((s, d) => s + d.metals, 0).toFixed(3);
  const trees = (totalCO2 / 21).toFixed(1);

  function addDevice() {
    if (!newDevice.name || !newDevice.kg) return;
    const kg = parseFloat(newDevice.kg);
    const co2 = +(kg * 22).toFixed(1);
    const metals = +(kg * 0.05).toFixed(3);
    setDevices(d => [...d, { id: Date.now(), ...newDevice, kg, co2, metals }]);
    setNewDevice({ name: '', status: 'Recycled', kg: '' });
    setShowAdd(false);
  }

  return (
    <div className="min-h-screen bg-bg pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="text-xs font-bold text-mint uppercase tracking-widest mb-2">Layer 3</div>
            <h1 className="text-4xl font-black text-navy mb-3">Impact Dashboard</h1>
            <p className="text-navy/60 text-lg">Track your carbon saved, metals recovered, and waste diverted.</p>
          </div>
          <button
            onClick={() => setShowAdd(s => !s)}
            className="px-5 py-3 bg-mint text-navy font-bold rounded-xl hover:bg-mint-light transition-all"
          >
            + Add Device
          </button>
        </div>

        {/* Add Device Form */}
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="card p-6 mb-8 border border-mint/20">
            <h3 className="font-bold text-navy mb-4">Log Disposed Device</h3>
            <div className="grid sm:grid-cols-4 gap-4">
              <input
                value={newDevice.name}
                onChange={e => setNewDevice(d => ({ ...d, name: e.target.value }))}
                placeholder="Device name"
                className="px-4 py-2 border border-navy/20 rounded-xl text-navy focus:outline-none focus:border-mint"
              />
              <select
                value={newDevice.status}
                onChange={e => setNewDevice(d => ({ ...d, status: e.target.value }))}
                className="px-4 py-2 border border-navy/20 rounded-xl text-navy focus:outline-none focus:border-mint"
              >
                <option>Recycled</option>
                <option>Resold</option>
                <option>Pending</option>
              </select>
              <input
                type="number"
                value={newDevice.kg}
                onChange={e => setNewDevice(d => ({ ...d, kg: e.target.value }))}
                placeholder="Weight (kg)"
                className="px-4 py-2 border border-navy/20 rounded-xl text-navy focus:outline-none focus:border-mint"
              />
              <button
                onClick={addDevice}
                className="py-2 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-all"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard value={devices.length} unit="devices" label="Total Disposed" icon="📦" accent="text-navy" />
          <StatCard value={totalCO2} unit="kg CO₂" label="Carbon Saved" icon="🌍" accent="text-mint" />
          <StatCard value={totalKg} unit="kg" label="E-Waste Diverted" icon="♻️" accent="text-navy" />
          <StatCard value={trees} unit="trees" label="Equivalent Planted" icon="🌱" accent="text-mint" />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="card p-6">
            <h3 className="font-bold text-navy mb-4 text-sm uppercase tracking-wider">Monthly Devices Disposed</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY_DATA}>
                <XAxis dataKey="month" tick={{ fill: '#143C3D', fontSize: 11 }} />
                <YAxis tick={{ fill: '#143C3D', fontSize: 11 }} />
                <Tooltip contentStyle={{ border: 'none', borderRadius: 8, background: '#fff' }} />
                <Bar dataKey="devices" fill="#2FC7A8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-navy mb-4 text-sm uppercase tracking-wider">CO₂ Saved Over Time (kg)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={MONTHLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#143C3D15" />
                <XAxis dataKey="month" tick={{ fill: '#143C3D', fontSize: 11 }} />
                <YAxis tick={{ fill: '#143C3D', fontSize: 11 }} />
                <Tooltip contentStyle={{ border: 'none', borderRadius: 8, background: '#fff' }} />
                <Line type="monotone" dataKey="co2" stroke="#143C3D" strokeWidth={2.5} dot={{ fill: '#2FC7A8', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Devices Table */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-navy/10">
            <h3 className="font-bold text-navy text-sm uppercase tracking-wider">Device Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-bg text-xs font-bold text-navy/40 uppercase tracking-wider">
                  <th className="px-6 py-3 text-left">Device</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Weight</th>
                  <th className="px-6 py-3 text-right">CO₂ Saved</th>
                  <th className="px-6 py-3 text-right">Metals Recovered</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((d, i) => (
                  <tr key={d.id} className={`border-t border-navy/5 ${i % 2 === 0 ? 'bg-white' : 'bg-bg/50'}`}>
                    <td className="px-6 py-4 font-medium text-navy">{d.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${STATUS_DOT[d.status]}`} />
                        <span className="text-sm text-navy/70">{d.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-navy/60">{d.kg} kg</td>
                    <td className="px-6 py-4 text-right font-semibold text-mint">{d.co2} kg</td>
                    <td className="px-6 py-4 text-right text-sm text-navy/60">{d.metals} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Metals breakdown */}
        <div className="mt-6 card p-6">
          <h3 className="font-bold text-navy mb-5 text-sm uppercase tracking-wider">Metals Recovered Breakdown</h3>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { metal: 'Gold', pct: '0.03%', value: `${(totalKg * 0.0003).toFixed(4)} kg`, color: 'bg-yellow-400' },
              { metal: 'Copper', pct: '6.9%', value: `${(totalKg * 0.069).toFixed(3)} kg`, color: 'bg-orange-400' },
              { metal: 'Aluminum', pct: '14.1%', value: `${(totalKg * 0.141).toFixed(3)} kg`, color: 'bg-gray-400' },
              { metal: 'Iron/Steel', pct: '20.5%', value: `${(totalKg * 0.205).toFixed(3)} kg`, color: 'bg-slate-500' },
            ].map(m => (
              <div key={m.metal} className="text-center p-4 bg-bg rounded-xl">
                <div className={`w-8 h-8 rounded-full ${m.color} mx-auto mb-2`} />
                <div className="font-bold text-navy text-sm">{m.metal}</div>
                <div className="text-xs text-navy/40">{m.pct} of device</div>
                <div className="text-mint font-semibold text-sm mt-1">{m.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
