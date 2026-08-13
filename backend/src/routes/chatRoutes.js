// chatRoutes.js — REST endpoints for chat session management.
// Real-time message delivery itself happens over Socket.io (chatSocket.js).

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { startSession, getSessionMessages, getMySessions, endSession } = require('../controllers/chatController');

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Real-time expert chat sessions (REST for setup/history, Socket.io for live messages)
 */

/**
 * @swagger
 * /api/chat/sessions:
 *   post:
 *     summary: Start a chat session with an expert (responder or doctor)
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [expertId]
 *             properties:
 *               expertId: { type: integer }
 *     responses:
 *       201: { description: Session created }
 *   get:
 *     summary: List all chat sessions you're a participant in
 *     tags: [Chat]
 *     responses:
 *       200: { description: Array of sessions }
 */
router.post('/chat/sessions', authenticate, startSession);
router.get('/chat/sessions', authenticate, getMySessions);

/**
 * @swagger
 * /api/chat/sessions/{id}/messages:
 *   get:
 *     summary: Get full message history for a session (participants only)
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Session details and messages }
 *       403: { description: Not a participant in this session }
 */
router.get('/chat/sessions/:id/messages', authenticate, getSessionMessages);

/**
 * @swagger
 * /api/chat/sessions/{id}/end:
 *   patch:
 *     summary: End a chat session (participants only)
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Session ended }
 */
router.patch('/chat/sessions/:id/end', authenticate, endSession);

module.exports = router;
