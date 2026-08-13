import { api } from './api';

// Shapes confirmed live via Postman on 13 Aug 2026.
// Assessment: { id, type, title, questions: [string] }
// Submit response: { id, user_id, assessment_id, score, answers, taken_at, severity }
// Score history item: { id, score, taken_at, type, title, severity }

// Standard GAD-7 / PHQ-9 answer scale (0-3), confirmed to fit the API's
// accepted value range from the example payload.
export const ANSWER_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export async function listAssessments() {
  const { data } = await api.get('/api/assessments');
  return data;
}

export async function submitAssessment(type, answers) {
  const { data } = await api.post(`/api/assessments/${type}/submit`, { answers });
  return data;
}

export async function getMyScores() {
  const { data } = await api.get('/api/scores/me');
  return data;
}
