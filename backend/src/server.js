// server.js — the entry point. Sets up Express, middleware, and routes,
// then starts listening for requests.
//
// Phase 4 note: Socket.io needs a raw http.Server instance to attach to —
// app.listen() alone (Express's shortcut) creates one internally but doesn't
// expose it, so we create the http.Server explicitly here and pass it to
// BOTH Express and Socket.io. This is the standard pattern for combining
// a REST API and WebSocket server in one process.

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const authRoutes = require('./routes/authRoutes');
const forumRoutes = require('./routes/forumRoutes');
const wellnessRoutes = require('./routes/wellnessRoutes');
const chatRoutes = require('./routes/chatRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const initChatSocket = require('./chatSocket');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

app.use(cors());          // allows the React frontend (different port) to call this API
app.use(express.json());  // parses incoming JSON request bodies into req.body

// Interactive API docs — generated from JSDoc comments above each route,
// so the docs live next to the code they describe and are less likely to
// drift out of sync as routes change.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// Health check — useful to confirm the server is alive without hitting real logic
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindSpace API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api', forumRoutes);
app.use('/api', wellnessRoutes);
app.use('/api', chatRoutes);
app.use('/api', checkinRoutes);

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

initChatSocket(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`MindSpace backend running on http://localhost:${PORT}`);
  console.log('Socket.io ready for real-time chat connections.');
});

