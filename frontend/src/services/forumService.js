import { api } from './api';

// Shapes confirmed live via Postman on 13 Aug 2026.
// Post: { id, user_id, title, content, is_flagged, created_at, author_name, responses: [] }
// Response: { id, content, created_at, responder_name }

export async function listPosts() {
  const { data } = await api.get('/api/posts');
  return data;
}

export async function getPost(id) {
  const { data } = await api.get(`/api/posts/${id}`);
  return data;
}

export async function createPost({ title, content }) {
  const { data } = await api.post('/api/posts', { title, content });
  return data;
}

export async function deletePost(id) {
  await api.delete(`/api/posts/${id}`);
}

export async function draftResponse(postId, { content }) {
  const { data } = await api.post(`/api/posts/${postId}/responses`, { content });
  return data;
}

export async function flagPost(postId, { reason }) {
  const { data } = await api.post(`/api/posts/${postId}/flags`, { reason });
  return data;
}

// --- Moderator/admin: response moderation queue ---
// Pending response item: { id, content, status, created_at, post_title, responder_name }
export async function getPendingResponses() {
  const { data } = await api.get('/api/responses/pending');
  return data;
}

export async function approveResponse(id) {
  const { data } = await api.patch(`/api/responses/${id}/approve`);
  return data;
}

export async function rejectResponse(id) {
  const { data } = await api.patch(`/api/responses/${id}/reject`);
  return data;
}

// --- Moderator/admin: flag review queue ---
// Pending flag item: { id, reason, created_at, post_id, post_title, post_content, flagged_by_name }
export async function getPendingFlags() {
  const { data } = await api.get('/api/flags/pending');
  return data;
}

export async function reviewFlag(id, { deletePost = false } = {}) {
  const { data } = await api.patch(`/api/flags/${id}/review`, { deletePost });
  return data;
}
