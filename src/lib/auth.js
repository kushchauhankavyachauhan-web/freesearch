export function getUser() {
  try {
    const raw = localStorage.getItem('lifen_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth(token, user) {
  localStorage.setItem('lifen_token', token);
  localStorage.setItem('lifen_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('lifen_token');
  localStorage.removeItem('lifen_user');
}

export function isAuthenticated() {
  return !!localStorage.getItem('lifen_token');
}
