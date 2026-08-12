// wellnessRoutes.js — assessments, score history, resources, and the
// PII-free analytics dashboard for doctors/admins.

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

const { getAssessments, submitScore, getMyScores, getAnalytics } = require('../controllers/assessmentsController');
const { getResources, createResource } = require('../controllers/resourcesController');

// --- Assessments ---
router.get('/assessments', authenticate, getAssessments);
router.post('/assessments/:type/submit', authenticate, submitScore);
router.get('/scores/me', authenticate, getMyScores);

// --- Doctor/admin analytics — no PII, aggregated only ---
router.get('/analytics/scores', authenticate, requireRole('doctor', 'admin'), getAnalytics);

// --- Resources ---
router.get('/resources', authenticate, getResources);
router.post('/resources', authenticate, requireRole('admin'), createResource);

module.exports = router;
