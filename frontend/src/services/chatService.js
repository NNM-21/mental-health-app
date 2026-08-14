import { api } from './api';

// Shapes confirmed live via Postman on 14 Aug 2026.
export async function listExperts() {
  const { data } = await api.get('/api/chat/experts');
  return data; // [{ id, name, role }]
}

export async function startSession(expertId) {
  const { data } = await api.post('/api/chat/sessions', { expertId });
  return data; // { id, patient_id, expert_id, started_at, ended_at }
}

export async function listMySessions() {
  const { data } = await api.get('/api/chat/sessions');
  return data; // [{ id, started_at, ended_at, patient_name, expert_name, patient_id, expert_id }]
}

export async function getSessionMessages(id) {
  const { data } = await api.get(`/api/chat/sessions/${id}/messages`);
  return data; // { session, messages: [{ id, sender_id, content, sent_at, sender_name }] }
}

export async function endSession(id) {
  const { data } = await api.patch(`/api/chat/sessions/${id}/end`);
  return data;
}
