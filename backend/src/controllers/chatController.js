// chatController.js — REST side of the chat feature: starting a session,
// fetching message history, and ending a session. The actual real-time
// message delivery happens over Socket.io (see chatSocket.js), not here —
// these routes handle the parts that don't need to be "live."

const pool = require('../config/db');

// A patient starts a session with a specific expert (responder or doctor).
async function startSession(req, res) {
  try {
    const { expertId } = req.body;
    const patientId = req.user.id;

    if (!expertId) {
      return res.status(400).json({ error: 'expertId is required.' });
    }

    const expertResult = await pool.query(
      "SELECT id, role FROM users WHERE id = $1 AND role IN ('responder', 'doctor')",
      [expertId]
    );
    if (expertResult.rows.length === 0) {
      return res.status(404).json({ error: 'Expert not found, or user is not a responder/doctor.' });
    }

    const result = await pool.query(
      `INSERT INTO chat_sessions (patient_id, expert_id) VALUES ($1, $2)
       RETURNING id, patient_id, expert_id, started_at, ended_at`,
      [patientId, expertId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Start session error:', err.message);
    res.status(500).json({ error: 'Something went wrong starting the chat session.' });
  }
}

// Message history for a session. Only the two participants (patient or
// expert on that specific session) can read it — this is an ownership
// check on chat data, the same pattern as deleting a post in Phase 2.
async function getSessionMessages(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sessionResult = await pool.query('SELECT * FROM chat_sessions WHERE id = $1', [id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    const session = sessionResult.rows[0];

    const isParticipant = session.patient_id === userId || session.expert_id === userId;
    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not a participant in this chat session.' });
    }

    const messagesResult = await pool.query(
      `SELECT m.id, m.sender_id, m.content, m.sent_at, u.name AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.session_id = $1
       ORDER BY m.sent_at ASC`,
      [id]
    );

    res.json({ session, messages: messagesResult.rows });
  } catch (err) {
    console.error('Get session messages error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching the chat history.' });
  }
}

// List all sessions the logged-in user is part of (either side).
async function getMySessions(req, res) {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT cs.id, cs.started_at, cs.ended_at,
              p.name AS patient_name, e.name AS expert_name,
              cs.patient_id, cs.expert_id
       FROM chat_sessions cs
       JOIN users p ON cs.patient_id = p.id
       JOIN users e ON cs.expert_id = e.id
       WHERE cs.patient_id = $1 OR cs.expert_id = $1
       ORDER BY cs.started_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get my sessions error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching your sessions.' });
  }
}

async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sessionResult = await pool.query('SELECT * FROM chat_sessions WHERE id = $1', [id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    const session = sessionResult.rows[0];
    const isParticipant = session.patient_id === userId || session.expert_id === userId;
    if (!isParticipant) {
      return res.status(403).json({ error: 'You are not a participant in this chat session.' });
    }

    const result = await pool.query(
      'UPDATE chat_sessions SET ended_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('End session error:', err.message);
    res.status(500).json({ error: 'Something went wrong ending the session.' });
  }
}

module.exports = { startSession, getSessionMessages, getMySessions, endSession };
