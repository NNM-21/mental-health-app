// auth.js — middleware that checks "is this person logged in?"
// This runs BEFORE the actual route handler, on any route that needs it.
// It reads the JWT from the Authorization header, verifies it's valid,
// and attaches the decoded user info to req.user for later use.

const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization']; // format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role } — set during login/register
    next(); // move on to the actual route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = authenticate;
