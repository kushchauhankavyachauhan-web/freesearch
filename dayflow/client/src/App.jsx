import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import Notes from './pages/Notes'

const PAGES = { dashboard: Dashboard, planner: Planner, habits: Habits, goals: Goals, notes: Notes }

export default function App() {
  const [page, setPage] = useState('dashboard')
  const Page = PAGES[page]

  return (
    <div className="flex min-h-screen bg-bg text-slate-200">
      <Sidebar current={page} onNavigate={setPage} />
      <main className="flex-1 ml-56 p-8 overflow-y-auto min-h-screen">
        <Page />
      </main>
    </div>
  )
}
