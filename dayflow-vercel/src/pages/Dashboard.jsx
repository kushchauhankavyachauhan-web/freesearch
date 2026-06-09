import { useEffect, useState } from 'react'
import { Bar, Pie, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js'
import StatCard from '../components/StatCard'
import * as api from '../api'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title)

const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "Well done is better than well said. — Benjamin Franklin",
  "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
  "The way to get started is to quit talking and begin doing. — Walt Disney",
  "Hard work beats talent when talent doesn't work hard. — Tim Notke",
  "Push yourself, because no one else is going to do it for you.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work, the luckier you get. — Gary Player",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do what you have to do until you can do what you want to do.",
  "The key to success is to focus on goals, not obstacles.",
  "Dream bigger. Do bigger.",
  "You don't have to be great to start, but you have to start to be great.",
]

const quote = QUOTES[new Date().getDate() % QUOTES.length]

const chartOptions = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8' } } },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
    y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
  },
}

const CATEGORY_COLORS = ['#3B82F6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [categories, setCategories] = useState([])
  const [weekly, setWeekly] = useState([])
  const [habitWeek, setHabitWeek] = useState([])
  const [heatmap, setHeatmap] = useState([])

  useEffect(() => {
    api.getStatsToday().then(setStats)
    api.getStatsCategories().then(setCategories)
    api.getStatsWeekly().then(setWeekly)
    api.getStatsHabitWeek().then(setHabitWeek)
    api.getStatsHeatmap().then(setHeatmap)
  }, [])

  const weeklyChart = {
    labels: weekly.map(d => d.date.slice(5)),
    datasets: [
      { label: 'Done', data: weekly.map(d => d.done), backgroundColor: '#3B82F6', borderRadius: 4 },
      { label: 'Pending', data: weekly.map(d => d.pending), backgroundColor: '#1e293b', borderRadius: 4 },
    ],
  }

  const catChart = {
    labels: categories.map(c => c.category),
    datasets: [{
      data: categories.map(c => c.count),
      backgroundColor: CATEGORY_COLORS,
      borderWidth: 0,
    }],
  }

  const habitTotal = habitWeek[habitWeek.length - 1]?.total || 1
  const habitDoneToday = habitWeek[habitWeek.length - 1]?.done || 0
  const habitPct = habitTotal ? Math.round((habitDoneToday / habitTotal) * 100) : 0

  const donutChart = {
    labels: ['Done', 'Remaining'],
    datasets: [{
      data: [habitDoneToday, Math.max(0, habitTotal - habitDoneToday)],
      backgroundColor: ['#3B82F6', '#1e293b'],
      borderWidth: 0,
    }],
  }

  const maxIntensity = Math.max(1, ...heatmap.map(d => d.intensity))

  return (
    <div className="space-y-6">
      {/* Quote */}
      <div className="bg-card border border-slate-800 rounded-xl px-6 py-4">
        <p className="text-sm text-slate-400 italic">"{quote}"</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tasks Today" value={stats ? `${stats.tasksDone}/${stats.tasksTotal}` : '—'} sub="completed today" />
        <StatCard label="Habits Done" value={stats ? `${habitPct}%` : '—'} sub={`${habitDoneToday} of ${habitTotal}`} color="text-emerald-400" />
        <StatCard label="Goals Achieved" value={stats ? `${stats.goalsAchieved}/${stats.goalsTotal}` : '—'} sub="today" color="text-amber-400" />
        <StatCard label="All-Time Done" value={stats?.allTimeDone ?? '—'} sub="total tasks completed" color="text-purple-400" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">7-Day Tasks (Done vs Pending)</h3>
          {weekly.length > 0
            ? <Bar data={weeklyChart} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { labels: { color: '#94a3b8' } } } }} />
            : <p className="text-slate-600 text-sm text-center py-8">No task data yet</p>
          }
        </div>
        <div className="bg-card rounded-xl p-5 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Tasks by Category (Today)</h3>
          {categories.length > 0
            ? <div className="max-w-xs mx-auto"><Pie data={catChart} options={{ plugins: { legend: { labels: { color: '#94a3b8' } } } }} /></div>
            : <p className="text-slate-600 text-sm text-center py-8">No tasks for today yet</p>
          }
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Habit Completion Rate (Today)</h3>
          <div className="max-w-[200px] mx-auto relative">
            <Doughnut data={donutChart} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-accent">{habitPct}%</span>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-card rounded-xl p-5 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">7-Day Activity Heatmap</h3>
          <div className="flex gap-2 mt-6 justify-center">
            {heatmap.map((d, i) => {
              const alpha = d.intensity === 0 ? 0.08 : 0.2 + (d.intensity / maxIntensity) * 0.8
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-10 h-10 rounded-lg transition-all"
                    style={{ background: `rgba(59,130,246,${alpha})`, border: '1px solid rgba(59,130,246,0.2)' }}
                    title={`${d.date}: ${d.intensity} activities`}
                  />
                  <span className="text-xs text-slate-600">{d.date.slice(5)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2 mt-4 justify-center">
            <span className="text-xs text-slate-600">Less</span>
            {[0.08, 0.3, 0.55, 0.8, 1].map((a, i) => (
              <div key={i} className="w-4 h-4 rounded" style={{ background: `rgba(59,130,246,${a})` }} />
            ))}
            <span className="text-xs text-slate-600">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
