import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { getUser, clearAuth } from '../lib/auth';
import OrbBackground from '../components/OrbBackground';
import Button from '../components/Button';
import Card from '../components/Card';

const categoryColors = {
  goal: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  person: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  urgent: 'bg-red-500/20 text-red-300 border-red-500/30',
  opportunity: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

function DailyBrief({ items, summary, loading, onRefresh }) {
  return (
    <Card className="col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Daily Brief</h2>
          <p className="text-white/40 text-xs mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="text-white/30 hover:text-white/70 transition-colors text-xs"
        >
          ↺ Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/30 text-sm">No brief yet. Paste some content below to get started.</p>
        </div>
      ) : (
        <>
          {summary && (
            <p className="text-white/50 text-sm mb-4 italic">{summary}</p>
          )}
          <div className="space-y-2">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 p-3 bg-white/3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-indigo-600/40 flex-shrink-0 flex items-center justify-center text-xs font-bold text-indigo-300 mt-0.5">
                  {item.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{item.title}</p>
                  {item.reason && (
                    <p className="text-white/40 text-xs mt-0.5 truncate">{item.reason}</p>
                  )}
                </div>
                {item.category && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${categoryColors[item.category] || categoryColors.goal}`}>
                    {item.category}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

function AIFilter({ onResult }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.ai.filter(content);
      onResult(result);
      setContent('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-1">Life Filter</h2>
      <p className="text-white/40 text-xs mb-4">Paste messages, news, emails — get back only what matters.</p>

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Paste anything here — a thread, article, email, message…"
        rows={5}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-sm"
      />

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

      <Button
        onClick={submit}
        disabled={loading || !content.trim()}
        className="w-full mt-3"
      >
        {loading ? '🧠 Filtering…' : '✦ Filter with AI'}
      </Button>
    </Card>
  );
}

function HabitStrip({ habits, onToggle }) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-widest text-xs">Today's Habits</h2>
      {habits.length === 0 ? (
        <p className="text-white/30 text-sm">No habits yet. Add some in your profile.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {habits.map(h => (
            <motion.button
              key={h.id}
              onClick={() => onToggle(h.id)}
              whileTap={{ scale: 0.9 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all duration-200 ${
                h.completedToday
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
              }`}
            >
              <span>{h.icon}</span>
              <span className="font-medium">{h.name}</span>
              {h.completedToday && <span className="text-indigo-300">✓</span>}
            </motion.button>
          ))}
        </div>
      )}
    </Card>
  );
}

function GoalProgress({ goals }) {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-widest text-xs">Goals</h2>
      {goals.length === 0 ? (
        <p className="text-white/30 text-sm">No goals set. Add goals in onboarding or settings.</p>
      ) : (
        <div className="space-y-4">
          {goals.map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <div key={g.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/80">{g.title}</span>
                  <span className="text-white/40">{g.current}/{g.target} {g.unit}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: g.color || '#4F46E5' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function Nav({ user, onDeepWork, onReport }) {
  const navigate = useNavigate();
  const logout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-white/5">
      <div className="text-xl font-bold gradient-text">Lifen</div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onReport}>Reports</Button>
        <Button variant="secondary" size="sm" onClick={onDeepWork}>⏳ Deep Work</Button>
        <div className="w-8 h-8 rounded-full bg-indigo-600/40 flex items-center justify-center text-sm font-semibold text-white">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
      </div>
    </nav>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [brief, setBrief] = useState({ items: [], summary: '' });
  const [briefLoading, setBriefLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);

  const loadBrief = useCallback(async () => {
    setBriefLoading(true);
    try {
      const data = await api.ai.dailyBrief();
      setBrief(data);
    } catch {
      setBrief({ items: [], summary: '' });
    } finally {
      setBriefLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrief();
    api.habits.list().then(setHabits).catch(() => {});
    api.goals.list().then(setGoals).catch(() => {});
  }, [loadBrief]);

  const handleFilterResult = (result) => {
    setBrief(result);
  };

  const handleToggleHabit = async (habitId) => {
    await api.habits.toggle(habitId);
    const updated = await api.habits.list();
    setHabits(updated);
  };

  return (
    <div className="min-h-screen bg-[#0D0B2A] relative">
      <OrbBackground className="opacity-30" />

      <div className="relative z-10">
        <Nav
          user={user}
          onDeepWork={() => navigate('/deepwork')}
          onReport={() => navigate('/report')}
        />

        <main className="max-w-6xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}.
            </h1>
            <p className="text-white/40 mt-1">Here's what matters today.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Daily Brief (spans 2 cols on large) */}
            <div className="lg:col-span-2 space-y-6">
              <DailyBrief
                items={brief.items || []}
                summary={brief.summary}
                loading={briefLoading}
                onRefresh={loadBrief}
              />
              <AIFilter onResult={handleFilterResult} />
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              <HabitStrip habits={habits} onToggle={handleToggleHabit} />
              <GoalProgress goals={goals} />

              <Card>
                <h2 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-widest text-xs">Quick Actions</h2>
                <div className="space-y-2">
                  <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => navigate('/deepwork')}>
                    ⏳ Start deep work session
                  </Button>
                  <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => navigate('/report')}>
                    📊 View weekly report
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
