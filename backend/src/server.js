// server.js — the entry point. Sets up Express, middleware, and routes,
// then starts listening for requests.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());          // allows the React frontend (different port) to call this API
app.use(express.json());  // parses incoming JSON request bodies into req.body

// Health check — useful to confirm the server is alive without hitting real logic
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MindSpace API is running.' });
});

app.use('/api/auth', authRoutes);

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MindSpace backend running on http://localhost:${PORT}`);
});
