// wellnessRoutes.js — assessments, score history, resources, and the
// PII-free analytics dashboard for doctors/admins.

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

const { getAssessments, submitScore, getMyScores, getAnalytics } = require('../controllers/assessmentsController');
const { getResources, createResource } = require('../controllers/resourcesController');

/**
 * @swagger
 * tags:
 *   name: Wellness
 *   description: GAD7/PHQ9 assessments, score history, resources, and PII-free analytics
 */

/**
 * @swagger
 * /api/assessments:
 *   get:
 *     summary: List available assessments (GAD7, PHQ9) with their questions
 *     tags: [Wellness]
 *     responses:
 *       200: { description: Array of assessments }
 */
router.get('/assessments', authenticate, getAssessments);

/**
 * @swagger
 * /api/assessments/{type}/submit:
 *   post:
 *     summary: Submit answers to an assessment. Score is computed server-side.
 *     tags: [Wellness]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [GAD7, PHQ9] }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 type: array
 *                 items: { type: integer, minimum: 0, maximum: 3 }
 *                 example: [2, 2, 1, 2, 1, 1, 2]
 *     responses:
 *       201: { description: Score computed and saved, includes severity band }
 *       400: { description: Wrong answer count or out-of-range value }
 */
router.post('/assessments/:type/submit', authenticate, submitScore);

/**
 * @swagger
 * /api/scores/me:
 *   get:
 *     summary: Get your own score history, oldest to newest
 *     tags: [Wellness]
 *     responses:
 *       200: { description: Array of your past scores with severity }
 */
router.get('/scores/me', authenticate, getMyScores);

/**
 * @swagger
 * /api/analytics/scores:
 *   get:
 *     summary: Aggregated score analytics — NO patient names or IDs (doctor/admin only)
 *     tags: [Wellness]
 *     responses:
 *       200: { description: Per-assessment count/average/min/max, fully anonymized }
 *       403: { description: Caller is not a doctor/admin }
 */
router.get('/analytics/scores', authenticate, requireRole('doctor', 'admin'), getAnalytics);

/**
 * @swagger
 * /api/resources:
 *   get:
 *     summary: List curated resources, optionally filtered by category
 *     tags: [Wellness]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema: { type: string, example: anxiety }
 *     responses:
 *       200: { description: Array of resources }
 *   post:
 *     summary: Add a new resource (admin only)
 *     tags: [Wellness]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type, url, category]
 *             properties:
 *               title: { type: string }
 *               type: { type: string, enum: [video, article] }
 *               url: { type: string }
 *               category: { type: string }
 *     responses:
 *       201: { description: Resource created }
 *       403: { description: Caller is not an admin }
 */
router.get('/resources', authenticate, getResources);
router.post('/resources', authenticate, requireRole('admin'), createResource);

module.exports = router;

