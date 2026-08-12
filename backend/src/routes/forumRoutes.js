// forumRoutes.js — routes for the Q&A forum: posts, responses, flags.
// Reuses the same authenticate + requireRole middleware built in Phase 1.

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roles');

const { createPost, getAllPosts, getPostById, deletePost } = require('../controllers/postsController');
const { createResponse, getPendingResponses, approveResponse, rejectResponse } = require('../controllers/responsesController');
const { createFlag, getPendingFlags, reviewFlag } = require('../controllers/flagsController');

/**
 * @swagger
 * tags:
 *   name: Forum
 *   description: Q&A posts, the 3-step response moderation workflow, and flags
 */

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a post
 *     tags: [Forum]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *     responses:
 *       201: { description: Post created }
 *   get:
 *     summary: List all posts, each with its approved responses only
 *     tags: [Forum]
 *     responses:
 *       200: { description: Array of posts }
 */
router.post('/posts', authenticate, createPost);
router.get('/posts', authenticate, getAllPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get one post with its approved responses
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: The post }
 *       404: { description: Post not found }
 *   delete:
 *     summary: Delete a post (owner, or moderator/admin only)
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 *       403: { description: Not the owner and not a moderator/admin }
 */
router.get('/posts/:id', authenticate, getPostById);
router.delete('/posts/:id', authenticate, deletePost);

/**
 * @swagger
 * /api/posts/{postId}/responses:
 *   post:
 *     summary: Draft a response to a post (responder only). Starts hidden until approved.
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
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
 *       201: { description: Draft response created }
 *       403: { description: Caller is not a responder }
 */
router.post('/posts/:postId/responses', authenticate, requireRole('responder'), createResponse);

/**
 * @swagger
 * /api/responses/pending:
 *   get:
 *     summary: List all draft responses awaiting moderation (moderator/admin only)
 *     tags: [Forum]
 *     responses:
 *       200: { description: Array of pending responses }
 *       403: { description: Caller is not a moderator/admin }
 */
router.get('/responses/pending', authenticate, requireRole('moderator', 'admin'), getPendingResponses);

/**
 * @swagger
 * /api/responses/{id}/approve:
 *   patch:
 *     summary: Approve a draft response — it becomes visible to the patient (moderator/admin only)
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Response approved }
 */
router.patch('/responses/:id/approve', authenticate, requireRole('moderator', 'admin'), approveResponse);

/**
 * @swagger
 * /api/responses/{id}/reject:
 *   patch:
 *     summary: Reject a draft response — stays hidden permanently (moderator/admin only)
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Response rejected }
 */
router.patch('/responses/:id/reject', authenticate, requireRole('moderator', 'admin'), rejectResponse);

/**
 * @swagger
 * /api/posts/{postId}/flags:
 *   post:
 *     summary: Flag a post as harmful (any authenticated user)
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       201: { description: Flag recorded }
 */
router.post('/posts/:postId/flags', authenticate, createFlag);

/**
 * @swagger
 * /api/flags/pending:
 *   get:
 *     summary: List all unreviewed flags (moderator/admin only)
 *     tags: [Forum]
 *     responses:
 *       200: { description: Array of pending flags with post context }
 */
router.get('/flags/pending', authenticate, requireRole('moderator', 'admin'), getPendingFlags);

/**
 * @swagger
 * /api/flags/{id}/review:
 *   patch:
 *     summary: Mark a flag reviewed, optionally deleting the underlying post (moderator/admin only)
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deletePost: { type: boolean }
 *     responses:
 *       200: { description: Flag reviewed }
 */
router.patch('/flags/:id/review', authenticate, requireRole('moderator', 'admin'), reviewFlag);

module.exports = router;

