// checkinRoutes.js — routes for the AI Wellness Check-In feature.
// Same authenticate + requireRole middleware as every other route file.

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

const {
  submitCheckin,
  getMyCheckins,
  getPendingCheckinAlerts,
  reviewCheckinAlert,
} = require('../controllers/checkinsController');

/**
 * @swagger
 * tags:
 *   name: Check-Ins
 *   description: AI Wellness Check-In — journal entries with a bounded Gemini reflection, and the moderator alert queue for crisis entries
 */

/**
 * @swagger
 * /api/checkins:
 *   post:
 *     summary: Submit a journal entry. Gemini classifies it and returns a short reflection (safe entries) or a fixed safety message (crisis entries).
 *     tags: [Check-Ins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: string }
 *     responses:
 *       201: { description: Check-in saved, includes the reflection to show the user }
 *       400: { description: content is required }
 */
router.post('/checkins', authenticate, submitCheckin);

/**
 * @swagger
 * /api/checkins/me:
 *   get:
 *     summary: Get your own check-in history, oldest to newest
 *     tags: [Check-Ins]
 *     responses:
 *       200: { description: Array of your past check-ins with reflections }
 */
router.get('/checkins/me', authenticate, getMyCheckins);

/**
 * @swagger
 * /api/checkins/alerts/pending:
 *   get:
 *     summary: List check-ins still needing review — crisis classification, or classification failed (moderator/admin only)
 *     tags: [Check-Ins]
 *     responses:
 *       200: { description: Array of pending check-in alerts with author name/email }
 *       403: { description: Caller is not a moderator/admin }
 */
router.get('/checkins/alerts/pending', authenticate, requireRole('moderator', 'admin'), getPendingCheckinAlerts);

/**
 * @swagger
 * /api/checkins/alerts/{id}/review:
 *   patch:
 *     summary: Mark a check-in alert reviewed (moderator/admin only)
 *     tags: [Check-Ins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Alert marked reviewed }
 *       404: { description: Check-in not found }
 */
router.patch('/checkins/alerts/:id/review', authenticate, requireRole('moderator', 'admin'), reviewCheckinAlert);

module.exports = router;
