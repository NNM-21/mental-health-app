// authRoutes.js — defines the URLs for auth-related actions.
// Routes stay thin on purpose: they just point a URL + HTTP verb at a
// controller function. All the actual logic lives in the controller.

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

router.post('/register', register);
router.post('/login', login);

// A simple "who am I" route — any logged-in user can check their own info.
// Useful for the frontend to confirm the token is still valid.
router.get('/me', authenticate, (req, res) => {
  res.json({ id: req.user.id, role: req.user.role });
});

// Example RBAC-protected route: only admins can hit this.
// This exists purely to prove the role middleware works end-to-end —
// Phase 2+ will add real admin routes (user management, etc.) here.
router.get('/admin-only', authenticate, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin. This route is role-protected.' });
});

module.exports = router;
