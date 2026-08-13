// doctorAnalyticsController.js — extends the PII-free analytics pattern
// from Phase 3 (assessments) to cover the forum and chat too. The spec is
// explicit: a senior doctor sees everything EXCEPT patient-identifiable
// information. Phase 3 only satisfied this for assessment scores — these
// two functions close that gap for the other two parts of the app.

const pool = require('../config/db');

// Forum activity: counts and flag rates, never a specific post's author.
// Deliberately does NOT select posts.title, posts.content, or users.name —
// a doctor gets volume and moderation-health metrics, not readable content.
async function getForumAnalytics(req, res) {
  try {
    const totals = await pool.query(`
      SELECT
        COUNT(*) AS total_posts,
        COUNT(*) FILTER (WHERE is_flagged) AS flagged_posts,
        COUNT(*) FILTER (WHERE ai_classification = 'crisis') AS ai_flagged_crisis,
        COUNT(*) FILTER (WHERE ai_classification = 'harmful') AS ai_flagged_harmful
      FROM posts
    `);

    const responseStats = await pool.query(`
      SELECT status, COUNT(*) AS count
      FROM responses
      GROUP BY status
    `);

    res.json({
      posts: totals.rows[0],
      responsesByStatus: responseStats.rows,
    });
  } catch (err) {
    console.error('Get forum analytics error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching forum analytics.' });
  }
}

// Chat activity: session counts and message volume only — never message
// content, never which specific patient talked to which specific expert.
async function getChatAnalytics(req, res) {
  try {
    const sessionStats = await pool.query(`
      SELECT
        COUNT(*) AS total_sessions,
        COUNT(*) FILTER (WHERE ended_at IS NOT NULL) AS ended_sessions,
        COUNT(*) FILTER (WHERE ended_at IS NULL) AS active_sessions
      FROM chat_sessions
    `);

    const messageStats = await pool.query(`
      SELECT COUNT(*) AS total_messages,
             ROUND(AVG(msg_count), 1) AS avg_messages_per_session
      FROM (
        SELECT session_id, COUNT(*) AS msg_count
        FROM messages
        GROUP BY session_id
      ) per_session
    `);

    res.json({
      sessions: sessionStats.rows[0],
      messages: messageStats.rows[0],
    });
  } catch (err) {
    console.error('Get chat analytics error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching chat analytics.' });
  }
}

module.exports = { getForumAnalytics, getChatAnalytics };
