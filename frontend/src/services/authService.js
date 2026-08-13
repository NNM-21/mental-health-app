import { api } from './api';

// Response shape confirmed live via Postman on 13 Aug 2026:
// { user: { id, name, email, role, created_at }, token: "<JWT>" }

export async function register({ name, email, password, role }) {
  const { data } = await api.post('/api/auth/register', { name, email, password, role });
  return data; // { user, token }
}

export async function login({ email, password }) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data; // { user, token }
}

export async function getMe() {
  const { data } = await api.get('/api/auth/me');
  return data; // { id, role } per docs
}
