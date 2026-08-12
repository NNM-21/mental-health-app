// db.js — sets up a connection pool to PostgreSQL.
// We use a POOL (not a single connection) because our API will handle
// many requests at once. Each request borrows a connection from the pool
// and returns it when done, instead of opening/closing a connection every time.

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Render's managed Postgres requires SSL. Locally, DB_HOST is 'localhost'
  // and our local Postgres doesn't need SSL, so we only turn it on when
  // connecting to a real remote host. rejectUnauthorized: false is the
  // standard setting for Render's free-tier Postgres self-signed cert chain.
  ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },
});

// Quick sanity check on startup — fail loudly if the DB isn't reachable,
// instead of the server silently running but every query failing later.
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connected successfully.');
  }
});

module.exports = pool;

