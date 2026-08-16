// checkinsController.js — the AI Wellness Check-In feature.
// Three responsibilities: let a user submit a journal entry and get an AI
// reflection back, let them see their own history, and surface crisis
// entries to moderators — same "AI catches it, human reviews it" shape as
// Phase 4's post screening, just for a different content type.

const pool = require('../config/db');
const { reflectOnCheckin } = require('../checkinService');

// Submit a journal entry. Awaited (not fire-and-forget) because the user
// is on-screen waiting for a reflection, unlike post screening which runs
// after the post is already live.
async function submitCheckin(req, res) {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'content is required.' });
    }

    const { classification, reflection } = await reflectOnCheckin(content.trim());

    // Safe entries don't need a human to look at them — reviewed = true.
    // Crisis (or unclassifiable) entries stay unreviewed until a moderator
    // acts on them.
    const needsReview = classification !== 'safe';

    const result = await pool.query(
      `INSERT INTO checkins (user_id, content, ai_reflection, ai_classification, reviewed)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, content, ai_reflection, ai_classification, created_at`,
      [userId, content.trim(), reflection, classification, !needsReview]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Submit check-in error:', err.message);
    res.status(500).json({ error: 'Something went wrong submitting your check-in.' });
  }
}

// A user's own check-in history, oldest to newest — same shape as
// GET /api/scores/me.
async function getMyCheckins(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT id, content, ai_reflection, ai_classification, created_at
       FROM checkins
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get my check-ins error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching your check-ins.' });
  }
}

// Moderator/admin queue — every check-in still needing review (crisis
// classification, or classification failed outright). Includes the
// author's name/email since a moderator following up needs to know who.
async function getPendingCheckinAlerts(req, res) {
  try {
    const result = await pool.query(
      `SELECT c.id, c.content, c.ai_classification, c.created_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email
       FROM checkins c
       JOIN users u ON c.user_id = u.id
       WHERE c.reviewed = FALSE
       ORDER BY c.created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get pending check-in alerts error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching check-in alerts.' });
  }
}

// Moderator marks an alert reviewed — e.g. after following up with the
// user directly (outside the app, same as any real crisis response would be).
async function reviewCheckinAlert(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE checkins SET reviewed = TRUE WHERE id = $1
       RETURNING id, reviewed`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Check-in not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Review check-in alert error:', err.message);
    res.status(500).json({ error: 'Something went wrong reviewing this check-in.' });
  }
}

module.exports = { submitCheckin, getMyCheckins, getPendingCheckinAlerts, reviewCheckinAlert };
