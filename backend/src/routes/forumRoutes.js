// forumRoutes.js — routes for the Q&A forum: posts, responses, flags.
// Reuses the same authenticate + requireRole middleware built in Phase 1.

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

const { createPost, getAllPosts, getPostById, deletePost } = require('../controllers/postsController');
const { createResponse, getPendingResponses, approveResponse, rejectResponse } = require('../controllers/responsesController');
const { createFlag, getPendingFlags, reviewFlag } = require('../controllers/flagsController');

// --- Posts ---
// Any logged-in user can create/read posts. Delete has an ownership check
// inside the controller itself (see postsController.deletePost).
router.post('/posts', authenticate, createPost);
router.get('/posts', authenticate, getAllPosts);
router.get('/posts/:id', authenticate, getPostById);
router.delete('/posts/:id', authenticate, deletePost);

// --- Responses ---
// Only responders can draft answers. Only moderators/admins can approve or reject.
router.post('/posts/:postId/responses', authenticate, requireRole('responder'), createResponse);
router.get('/responses/pending', authenticate, requireRole('moderator', 'admin'), getPendingResponses);
router.patch('/responses/:id/approve', authenticate, requireRole('moderator', 'admin'), approveResponse);
router.patch('/responses/:id/reject', authenticate, requireRole('moderator', 'admin'), rejectResponse);

// --- Flags ---
// Any logged-in user can flag a post. Only moderators/admins see the queue and resolve flags.
router.post('/posts/:postId/flags', authenticate, createFlag);
router.get('/flags/pending', authenticate, requireRole('moderator', 'admin'), getPendingFlags);
router.patch('/flags/:id/review', authenticate, requireRole('moderator', 'admin'), reviewFlag);

module.exports = router;
