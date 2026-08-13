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
