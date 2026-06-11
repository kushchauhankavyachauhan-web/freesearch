const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  generateSop: (transcript, inputType) =>
    request('/sop/generate', { method: 'POST', body: { transcript, inputType } }),

  getHistory: () => request('/sop/history'),

  getSop: (id) => request(`/sop/${id}`),

  deleteSop: (id) => request(`/sop/${id}`, { method: 'DELETE' }),

  getSettings: () => request('/settings'),

  saveSettings: (settings) => request('/settings', { method: 'POST', body: settings }),

  exportNotion: (sop) => request('/export/notion', { method: 'POST', body: { sop } }),

  exportGoogleDocs: (sop) => request('/export/google-docs', { method: 'POST', body: { sop } }),

  getGoogleAuthUrl: () => request('/export/google/auth'),
};
