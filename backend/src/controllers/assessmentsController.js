// assessmentsController.js — self-assessment questionnaires (GAD7, PHQ9),
// scoring logic, and score history.
//
// Scoring: each question is answered 0-3 (Not at all / Several days /
// More than half the days / Nearly every day). Total score is just the sum.

const pool = require('../config/db');

// List available assessments with their questions — any logged-in user
// can view these, they need to see the questions before answering them.
async function getAssessments(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, type, title, questions FROM assessments ORDER BY type`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get assessments error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching assessments.' });
  }
}

// Patient submits their answers to an assessment. We calculate the score
// server-side (never trust a client-submitted total — someone could tamper
// with it) and store both the total and the raw answers for later review.
async function submitScore(req, res) {
  try {
    const { type } = req.params;   // 'GAD7' or 'PHQ9'
    const { answers } = req.body;  // array of numbers, each 0-3
    const userId = req.user.id;

    const assessmentResult = await pool.query(
      'SELECT id, questions FROM assessments WHERE type = $1',
      [type]
    );
    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment type not found.' });
    }
    const assessment = assessmentResult.rows[0];
    const expectedLength = assessment.questions.length;

    if (!Array.isArray(answers) || answers.length !== expectedLength) {
      return res.status(400).json({
        error: `answers must be an array of exactly ${expectedLength} numbers (0-3 each).`,
      });
    }
    if (answers.some((a) => typeof a !== 'number' || a < 0 || a > 3)) {
      return res.status(400).json({ error: 'Each answer must be a number between 0 and 3.' });
    }

    // The actual scoring logic: sum every answer. This is the real GAD7/PHQ9
    // scoring method — no weighting, no averaging, just a straight sum.
    const score = answers.reduce((total, a) => total + a, 0);

    const result = await pool.query(
      `INSERT INTO scores (user_id, assessment_id, score, answers)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, assessment_id, score, answers, taken_at`,
      [userId, assessment.id, score, JSON.stringify(answers)]
    );

    res.status(201).json({ ...result.rows[0], severity: interpretScore(type, score) });
  } catch (err) {
    console.error('Submit score error:', err.message);
    res.status(500).json({ error: 'Something went wrong submitting the assessment.' });
  }
}

// Patient's own score history, so they (and only they) can see their trend
// over time. Ordered oldest-to-newest, which is what a trend chart needs.
async function getMyScores(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT s.id, s.score, s.taken_at, a.type, a.title
       FROM scores s
       JOIN assessments a ON s.assessment_id = a.id
       WHERE s.user_id = $1
       ORDER BY s.taken_at ASC`,
      [userId]
    );
    const withSeverity = result.rows.map((row) => ({
      ...row,
      severity: interpretScore(row.type, row.score),
    }));
    res.json(withSeverity);
  } catch (err) {
    console.error('Get my scores error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching score history.' });
  }
}

// Doctor/admin dashboard — aggregated scores WITHOUT any patient-identifying
// information. This is the "privacy by design" piece from the project guide:
// a doctor can see trends and volume, but never WHO a specific score belongs to.
// Deliberately does NOT join to users.name or users.email.
async function getAnalytics(req, res) {
  try {
    const result = await pool.query(
      `SELECT a.type, a.title,
              COUNT(s.id) AS total_submissions,
              ROUND(AVG(s.score), 1) AS average_score,
              MIN(s.score) AS min_score,
              MAX(s.score) AS max_score
       FROM assessments a
       LEFT JOIN scores s ON s.assessment_id = a.id
       GROUP BY a.id, a.type, a.title
       ORDER BY a.type`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get analytics error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching analytics.' });
  }
}

// Standard clinical severity bands for GAD7 and PHQ9. Both scales happen to
// use the same 0-27 range with similar cutoffs, but we keep them explicit
// per type rather than assuming they'll always match (they don't, in the
// real clinical literature — GAD7 tops out at 21, not 27).
function interpretScore(type, score) {
  if (type === 'GAD7') {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
  }
  if (type === 'PHQ9') {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    if (score <= 19) return 'moderately severe';
    return 'severe';
  }
  return 'unknown';
}

module.exports = { getAssessments, submitScore, getMyScores, getAnalytics };
