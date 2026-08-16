import { api } from './api';

// Shapes match backend/src/controllers/checkinsController.js
// Checkin: { id, content, ai_reflection, ai_classification, created_at }
// Alert: { id, content, ai_classification, created_at, user_id, user_name, user_email }

export async function submitCheckin(content) {
  const { data } = await api.post('/api/checkins', { content });
  return data;
}

export async function getMyCheckins() {
  const { data } = await api.get('/api/checkins/me');
  return data;
}

// --- Moderator/admin ---
export async function getPendingCheckinAlerts() {
  const { data } = await api.get('/api/checkins/alerts/pending');
  return data;
}

export async function reviewCheckinAlert(id) {
  const { data } = await api.patch(`/api/checkins/alerts/${id}/review`);
  return data;
}
