// chatSocket.js — the real-time half of chat. REST (chatController.js)
// handles starting sessions and reading history; this file handles
// messages actually arriving live, the moment they're sent.
//
// Why Socket.io instead of plain HTTP? HTTP is request-response only — the
// client has to ask "any new messages?" repeatedly (polling), which is
// wasteful and laggy. Socket.io keeps a persistent connection open, so the
// server can PUSH a new message to the other participant the instant it
// arrives, with no polling needed.

const jwt = require('jsonwebtoken');
const pool = require('./config/db');

function initChatSocket(io) {
  // Every socket connection must present a valid JWT, same as REST routes.
  // Real-time chat carries the same auth requirement as everything else —
  // there's no separate, weaker security model just because it's a socket.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided.'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error('Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.user.id} (${socket.user.role})`);

    // Client joins a "room" named after the session id. Socket.io rooms let
    // us broadcast a message to exactly the two people in that
    // conversation, not every connected user on the whole server.
    socket.on('join_session', async (sessionId) => {
      try {
        const result = await pool.query('SELECT * FROM chat_sessions WHERE id = $1', [sessionId]);
        if (result.rows.length === 0) {
          return socket.emit('error', { message: 'Session not found.' });
        }
        const session = result.rows[0];
        const isParticipant = session.patient_id === socket.user.id || session.expert_id === socket.user.id;
        if (!isParticipant) {
          return socket.emit('error', { message: 'You are not a participant in this session.' });
        }
        socket.join(`session_${sessionId}`);
        socket.emit('joined_session', { sessionId });
      } catch (err) {
        console.error('join_session error:', err.message);
        socket.emit('error', { message: 'Something went wrong joining the session.' });
      }
    });

    // A message arrives: persist it to the database FIRST, then broadcast
    // it to everyone in the room. Persisting first means the message
    // history stays the source of truth even if a client disconnects
    // right after sending — the real-time push is a convenience layer on
    // top of a durable record, not a replacement for one.
    socket.on('send_message', async ({ sessionId, content }) => {
      try {
        if (!content || !content.trim()) return;

        const result = await pool.query(
          `INSERT INTO messages (session_id, sender_id, content)
           VALUES ($1, $2, $3)
           RETURNING id, session_id, sender_id, content, sent_at`,
          [sessionId, socket.user.id, content]
        );
        const message = result.rows[0];

        // Broadcast to everyone in the room, including the sender — this
        // keeps the sender's own UI in sync using the exact same code path
        // as the recipient, rather than optimistically rendering locally
        // and hoping it matches what got saved.
        io.to(`session_${sessionId}`).emit('new_message', message);
      } catch (err) {
        console.error('send_message error:', err.message);
        socket.emit('error', { message: 'Something went wrong sending the message.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user ${socket.user.id}`);
    });
  });
}

module.exports = initChatSocket;
