require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const animeListRoutes = require('./routes/animelist');
const { query: anilistQuery } = require('./services/anilist');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/list', animeListRoutes);

// Proxy AniList GraphQL to avoid CORS issues and enable server-side caching
app.post('/api/anilist', async (req, res) => {
  try {
    const { query, variables } = req.body;
    const data = await anilistQuery(query, variables);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'AniList API error', error: error.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
