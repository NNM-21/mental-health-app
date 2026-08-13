import axios from 'axios';

// Live backend — confirmed via /api-docs. No mocking; this app talks to the
// real deployed API from the start.
const BASE_URL = 'https://mental-health-app-1-a5qo.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the stored JWT to every request automatically once logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindspace_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected/expired anywhere in the app, clear it so the UI
// falls back to a logged-out state instead of silently failing forever.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mindspace_token');
      localStorage.removeItem('mindspace_user');
    }
    return Promise.reject(error);
  }
);
