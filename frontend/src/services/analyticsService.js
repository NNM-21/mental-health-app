import { api } from './api';

// All three endpoints require role doctor/admin (backend/src/routes/wellnessRoutes.js).
// Deliberately anonymized on the backend — no post content, message content,
// or patient names ever come back in these payloads.

// { posts: { total_posts, flagged_posts, ai_flagged_crisis, ai_flagged_harmful },
//   responsesByStatus: [{ status, count }] }
export async function getForumAnalytics() {
  const { data } = await api.get('/api/analytics/forum');
  return data;
}

// { sessions: { total_sessions, ended_sessions, active_sessions },
//   messages: { total_messages, avg_messages_per_session } }
export async function getChatAnalytics() {
  const { data } = await api.get('/api/analytics/chat');
  return data;
}

// Array, one row per assessment type:
// [{ type, title, total_submissions, average_score, min_score, max_score }]
// No patient identifiers.
export async function getScoreAnalytics() {
  const { data } = await api.get('/api/analytics/scores');
  return data;
}
