import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { api } from '../lib/api';
import Card from '../components/Card';
import Button from '../components/Button';
import OrbBackground from '../components/OrbBackground';

const COLORS = ['#4F46E5', '#818CF8', '#312E81', '#6366F1', '#A5B4FC'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-xs text-white">
      <p className="text-white/60 mb-1">{label}</p>
      <p className="font-semibold">{payload[0].value} min</p>
    </div>
  );
}

export default function WeeklyReport() {
  const navigate = useNavigate();
  const [focusData, setFocusData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.focus.history(7),
      api.goals.list(),
      api.habits.list(),
    ]).then(([focus, g, h]) => {
      // Fill in missing days
      const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const date = d.toISOString().split('T')[0];
        const found = focus.find(f => f.date === date);
        return {
          date,
          label: d.toLocaleDateString('en-US', { weekday: 'short' }),
          total_minutes: found?.total_minutes || 0,
        };
      });
      setFocusData(days);
      setGoals(g);
      setHabits(h);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalFocus = focusData.reduce((s, d) => s + (d.total_minutes || 0), 0);
  const avgFocus = focusData.length ? Math.round(totalFocus / 7) : 0;
  const completedGoals = goals.filter(g => g.current >= g.target).length;

  const goalPieData = goals.map((g, i) => ({
    name: g.title,
    value: Math.min(100, Math.round((g.current / g.target) * 100)),
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="min-h-screen bg-[#0D0B2A] relative">
      <OrbBackground className="opacity-20" />
      <div className="relative z-10">
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="text-xl font-bold gradient-text">Lifen</div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </Button>
        </nav>

        <main className="max-w-5xl mx-auto px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-white">Weekly Report</h1>
            <p className="text-white/40 mt-1">
              {new Date(Date.now() - 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total focus', value: `${Math.round(totalFocus / 60)}h ${totalFocus % 60}m`, sub: 'this week' },
              { label: 'Daily average', value: `${avgFocus}m`, sub: 'per day' },
              { label: 'Goals completed', value: `${completedGoals}/${goals.length}`, sub: 'on track' },
              { label: 'Habits today', value: `${habits.filter(h => h.completedToday).length}/${habits.length}`, sub: 'completed' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5"
              >
                <p className="text-white/40 text-xs uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-white/30 text-xs mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Focus time area chart */}
            <Card>
              <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-widest text-xs">Focus Time</h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={focusData}>
                  <defs>
                    <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total_minutes" stroke="#4F46E5" fill="url(#focusGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Goal progress */}
            <Card>
              <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-widest text-xs">Goal Progress</h2>
              {goals.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-white/30 text-sm">
                  No goals set
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={goalPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                        {goalPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {goalPieData.map((g, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white/80 text-xs truncate">{g.name}</p>
                          <div className="h-1 bg-white/10 rounded-full mt-1">
                            <div className="h-full rounded-full" style={{ width: `${g.value}%`, backgroundColor: g.color }} />
                          </div>
                        </div>
                        <span className="text-white/40 text-xs">{g.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Bar chart — daily focus */}
            <Card className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-widest text-xs">Daily Breakdown</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={focusData} barSize={24}>
                  <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total_minutes" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
