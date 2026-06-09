const BASE = '/api'

export const today = () => new Date().toISOString().slice(0, 10)

// Tasks
export const getTasks = (date) => fetch(`${BASE}/tasks?date=${date}`).then(r => r.json())
export const addTask = (data) => fetch(`${BASE}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json())
export const toggleTask = (id, done) => fetch(`${BASE}/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done }) }).then(r => r.json())
export const deleteTask = (id) => fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' }).then(r => r.json())

// Habits
export const getHabits = () => fetch(`${BASE}/habits`).then(r => r.json())
export const addHabit = (name) => fetch(`${BASE}/habits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }).then(r => r.json())
export const deleteHabit = (id) => fetch(`${BASE}/habits/${id}`, { method: 'DELETE' }).then(r => r.json())
export const logHabit = (habit_id, date) => fetch(`${BASE}/habit_logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ habit_id, date }) }).then(r => r.json())
export const unlogHabit = (habit_id, date) => fetch(`${BASE}/habit_logs`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ habit_id, date }) }).then(r => r.json())

// Goals
export const getGoals = (date) => fetch(`${BASE}/goals?date=${date}`).then(r => r.json())
export const addGoal = (text, date) => fetch(`${BASE}/goals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, date }) }).then(r => r.json())
export const updateGoal = (id, status) => fetch(`${BASE}/goals/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json())
export const deleteGoal = (id) => fetch(`${BASE}/goals/${id}`, { method: 'DELETE' }).then(r => r.json())

// Notes
export const getNote = (date) => fetch(`${BASE}/notes/${date}`).then(r => r.json())
export const saveNote = (date, content) => fetch(`${BASE}/notes/${date}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }).then(r => r.json())

// Stats
export const getStatsToday = () => fetch(`${BASE}/stats/today`).then(r => r.json())
export const getStatsCategories = () => fetch(`${BASE}/stats/categories`).then(r => r.json())
export const getStatsWeekly = () => fetch(`${BASE}/stats/weekly`).then(r => r.json())
export const getStatsHabitWeek = () => fetch(`${BASE}/stats/habit-week`).then(r => r.json())
export const getStatsHeatmap = () => fetch(`${BASE}/stats/heatmap`).then(r => r.json())
