// flagsController.js — lets any authenticated user flag a post as harmful,
// and gives moderators a queue to review flagged content.

const pool = require('../config/db');

async function createFlag(req, res) {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const flaggedBy = req.user.id;

    const postExists = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postExists.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Insert the flag record AND mark the post itself as flagged, in one
    // transaction-like pair of queries — both need to happen together for
    // the data to stay consistent (a flag with no marked post, or vice versa,
    // would be a bug).
    await pool.query(
      `INSERT INTO flags (post_id, flagged_by, reason) VALUES ($1, $2, $3)`,
      [postId, flaggedBy, reason || null]
    );
    await pool.query(`UPDATE posts SET is_flagged = TRUE WHERE id = $1`, [postId]);

    res.status(201).json({ message: 'Post flagged for review.' });
  } catch (err) {
    console.error('Create flag error:', err.message);
    res.status(500).json({ error: 'Something went wrong flagging the post.' });
  }
}

// Moderator queue — every flag not yet reviewed.
async function getPendingFlags(req, res) {
  try {
    const result = await pool.query(
      `SELECT f.id, f.reason, f.created_at,
              p.id AS post_id, p.title AS post_title, p.content AS post_content,
              u.name AS flagged_by_name
       FROM flags f
       JOIN posts p ON f.post_id = p.id
       JOIN users u ON f.flagged_by = u.id
       WHERE f.reviewed = FALSE
       ORDER BY f.created_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get pending flags error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching flags.' });
  }
}

// Moderator marks a flag reviewed. Optionally deletes the underlying post
// if it was genuinely harmful (pass { deletePost: true } in the body).
async function reviewFlag(req, res) {
  try {
    const { id } = req.params;
    const { deletePost } = req.body;

    const flagResult = await pool.query('SELECT post_id FROM flags WHERE id = $1', [id]);
    if (flagResult.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found.' });
    }
    const postId = flagResult.rows[0].post_id;

    await pool.query('UPDATE flags SET reviewed = TRUE WHERE id = $1', [id]);

    if (deletePost) {
      await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
      return res.json({ message: 'Flag reviewed and post deleted.' });
    }

    // If not deleting, un-flag the post so it shows normally again.
    await pool.query('UPDATE posts SET is_flagged = FALSE WHERE id = $1', [postId]);
    res.json({ message: 'Flag reviewed, post kept.' });
  } catch (err) {
    console.error('Review flag error:', err.message);
    res.status(500).json({ error: 'Something went wrong reviewing the flag.' });
  }
}

module.exports = { createFlag, getPendingFlags, reviewFlag };
