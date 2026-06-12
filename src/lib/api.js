const BASE = '/api';

function getToken() {
  return localStorage.getItem('lifen_token');
}

function headers(extra = {}) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: headers(opts.headers),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    signup: (data) => request('/auth?action=signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth?action=login', { method: 'POST', body: JSON.stringify(data) }),
  },
  profile: {
    get: () => request('/profile'),
    update: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },
  ai: {
    filter: (content) => request('/ai', { method: 'POST', body: JSON.stringify({ content, action: 'filter' }) }),
    dailyBrief: () => request('/ai', { method: 'POST', body: JSON.stringify({ content: 'generate', action: 'daily-brief' }) }),
  },
  tasks: {
    list: () => request('/tasks'),
    create: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (data) => request('/tasks', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/tasks?id=${id}`, { method: 'DELETE' }),
  },
  habits: {
    list: () => request('/habits'),
    toggle: (habitId) => request('/habits', { method: 'POST', body: JSON.stringify({ action: 'toggle', habitId }) }),
    create: (data) => request('/habits', { method: 'POST', body: JSON.stringify({ action: 'create', ...data }) }),
    delete: (habitId) => request('/habits', { method: 'POST', body: JSON.stringify({ action: 'delete', habitId }) }),
  },
  goals: {
    list: () => request('/goals'),
    create: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
    update: (data) => request('/goals', { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/goals?id=${id}`, { method: 'DELETE' }),
  },
  focus: {
    log: (duration_minutes) => request('/focus', { method: 'POST', body: JSON.stringify({ duration_minutes }) }),
    history: (days) => request(`/focus?days=${days}`),
  },
};
