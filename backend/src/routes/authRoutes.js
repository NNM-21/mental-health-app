// authRoutes.js — defines the URLs for auth-related actions.
// Routes stay thin on purpose: they just point a URL + HTTP verb at a
// controller function. All the actual logic lives in the controller.

const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Registration, login, and role-based access control
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Nikita Mishra" }
 *               email: { type: string, example: "nikita@example.com" }
 *               password: { type: string, example: "securepass123" }
 *               role: { type: string, enum: [patient, responder, moderator, doctor, admin], example: "patient" }
 *     responses:
 *       201:
 *         description: User created, returns user object and JWT
 *       409:
 *         description: Email already registered
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in with email and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, returns user object and JWT
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the currently logged-in user's id and role
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: The logged-in user's id and role
 *       401:
 *         description: No token provided or token invalid
 */
router.get('/me', authenticate, (req, res) => {
  res.json({ id: req.user.id, role: req.user.role });
});

/**
 * @swagger
 * /api/auth/admin-only:
 *   get:
 *     summary: Example RBAC-protected route (admin only)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Success — caller is an admin
 *       403:
 *         description: Caller is authenticated but not an admin
 */
router.get('/admin-only', authenticate, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin. This route is role-protected.' });
});

module.exports = router;

