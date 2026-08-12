// resourcesController.js — curated videos/articles, browsable by category.

const pool = require('../config/db');

async function getResources(req, res) {
  try {
    const { category } = req.query; // optional ?category=anxiety filter

    const query = category
      ? { text: 'SELECT * FROM resources WHERE category = $1 ORDER BY created_at DESC', values: [category] }
      : { text: 'SELECT * FROM resources ORDER BY created_at DESC', values: [] };

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Get resources error:', err.message);
    res.status(500).json({ error: 'Something went wrong fetching resources.' });
  }
}

// Only admins curate the resource library — keeps content quality controlled
// rather than letting any user add arbitrary links.
async function createResource(req, res) {
  try {
    const { title, type, url, category } = req.body;
    if (!title || !type || !url || !category) {
      return res.status(400).json({ error: 'title, type, url, and category are all required.' });
    }

    const result = await pool.query(
      `INSERT INTO resources (title, type, url, category) VALUES ($1, $2, $3, $4)
       RETURNING id, title, type, url, category, created_at`,
      [title, type, url, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create resource error:', err.message);
    res.status(500).json({ error: 'Something went wrong adding the resource.' });
  }
}

module.exports = { getResources, createResource };
