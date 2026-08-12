// postsController.js — CRUD for forum posts.
// Any authenticated user can create a post and read posts. Only the post's
// owner (or a moderator/admin) can delete it.

const pool = require('../config/db');

async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required.' });
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, title, content)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, title, content, is_flagged, created_at`,
      [userId, title, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create post error:', err.message);
    res.status(500).json({ error: 'Something went wrong creating the post.' });
  }
}

// Lists all posts, along with their APPROVED responses only.
// Draft/rejected responses stay invisible to everyone except the responder
// and moderators — that's the whole point of the moderation workflow.
async function getAllPosts(req, res) {
  try {
    const postsResult = await pool.query(
      `SELECT p.id, p.title, p.content, p.is_flagged, p.created_at,
              u.name AS author_name
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );

    const posts = postsResult.rows;

    // Attach approved responses to each post.
    // (Simple approach for now — fine at this scale. A future optimization
    // would be a single JOIN query instead of N+1 queries.)
    for (const post of posts) {
      const responsesResult = await pool.query(
        `SELECT r.id, r.content, r.created_at, u.name AS responder_name
         FROM responses r
         JOIN users u ON r.responder_id = u.id
         WHERE r.post_id = $1 AND r.status = 'approved'
         ORDER BY r.created_at ASC`,
        [post.id]
      );
      post.responses = responsesResult.rows;
    }

    res.json(posts);
  } catch (err) {
    console.error('Get posts error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching posts.' });
  }
}

async function getPostById(req, res) {
  try {
    const { id } = req.params;

    const postResult = await pool.query(
      `SELECT p.id, p.title, p.content, p.is_flagged, p.created_at,
              u.name AS author_name
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const post = postResult.rows[0];

    const responsesResult = await pool.query(
      `SELECT r.id, r.content, r.created_at, u.name AS responder_name
       FROM responses r
       JOIN users u ON r.responder_id = u.id
       WHERE r.post_id = $1 AND r.status = 'approved'
       ORDER BY r.created_at ASC`,
      [id]
    );
    post.responses = responsesResult.rows;

    res.json(post);
  } catch (err) {
    console.error('Get post error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching the post.' });
  }
}

async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const existing = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const isOwner = existing.rows[0].user_id === userId;
    const isModerator = role === 'moderator' || role === 'admin';

    // Ownership check happens in the controller, not middleware — because
    // "can you delete THIS post" depends on data (who owns it), not just
    // "what's your role", which is all requireRole() can check.
    if (!isOwner && !isModerator) {
      return res.status(403).json({ error: 'You can only delete your own posts.' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    console.error('Delete post error:', err.message);
    res.status(500).json({ error: 'Something went wrong deleting the post.' });
  }
}

module.exports = { createPost, getAllPosts, getPostById, deletePost };
