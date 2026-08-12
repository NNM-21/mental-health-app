// responsesController.js — implements the 3-step content workflow:
// responder drafts a response -> moderator approves or rejects -> published.
//
// A response only becomes publicly visible (see postsController.getAllPosts)
// once its status is 'approved'. This is the core moderation state machine.

const pool = require('../config/db');

// Responder drafts a response to a post. Starts as 'draft' — NOT visible
// to patients yet, only to the responder themselves and to moderators.
async function createResponse(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const responderId = req.user.id;

    if (!content) {
      return res.status(400).json({ error: 'content is required.' });
    }

    const postExists = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postExists.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const result = await pool.query(
      `INSERT INTO responses (post_id, responder_id, content, status)
       VALUES ($1, $2, $3, 'draft')
       RETURNING id, post_id, responder_id, content, status, created_at`,
      [postId, responderId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create response error:', err.message);
    res.status(500).json({ error: 'Something went wrong creating the response.' });
  }
}

// Moderator queue — every response still in 'draft' status, waiting for review.
async function getPendingResponses(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.id, r.content, r.status, r.created_at,
              p.title AS post_title, u.name AS responder_name
       FROM responses r
       JOIN posts p ON r.post_id = p.id
       JOIN users u ON r.responder_id = u.id
       WHERE r.status = 'draft'
       ORDER BY r.created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get pending responses error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching pending responses.' });
  }
}

// Moderator approves a draft response -> becomes publicly visible.
async function approveResponse(req, res) {
  try {
    const { id } = req.params;
    const result = await updateResponseStatus(id, 'approved');
    if (!result) return res.status(404).json({ error: 'Response not found.' });
    res.json(result);
  } catch (err) {
    console.error('Approve response error:', err.message);
    res.status(500).json({ error: 'Something went wrong approving the response.' });
  }
}

// Moderator rejects a draft response -> stays hidden from patients forever
// (responder could see it was rejected and choose to write a new one).
async function rejectResponse(req, res) {
  try {
    const { id } = req.params;
    const result = await updateResponseStatus(id, 'rejected');
    if (!result) return res.status(404).json({ error: 'Response not found.' });
    res.json(result);
  } catch (err) {
    console.error('Reject response error:', err.message);
    res.status(500).json({ error: 'Something went wrong rejecting the response.' });
  }
}

// Shared helper — both approve and reject are "change the status" operations,
// just with a different target status. Keeps the two controller functions
// thin instead of duplicating the same UPDATE query twice.
async function updateResponseStatus(id, newStatus) {
  const result = await pool.query(
    `UPDATE responses SET status = $1 WHERE id = $2
     RETURNING id, post_id, responder_id, content, status, created_at`,
    [newStatus, id]
  );
  return result.rows[0] || null;
}

module.exports = { createResponse, getPendingResponses, approveResponse, rejectResponse };
