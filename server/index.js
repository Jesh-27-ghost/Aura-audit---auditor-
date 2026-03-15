const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// Routes
const authRoutes = require('./routes/auth');
const assessRoutes = require('./routes/assess');
const badgeRoutes = require('./routes/badge');
const verifyRoutes = require('./routes/verify');
const candidateRoutes = require('./routes/candidates');
const cvRoutes = require('./routes/cv');
const leaderboardRoutes = require('./routes/leaderboard');
const analyticsRoutes = require('./routes/analytics');
// const arenaRoutes = require('./routes/arena');
const puzzleRoutes = require('./routes/puzzle');
const { getSkillCategories } = require('./prompts/skillRubrics');

app.use('/api/auth', authRoutes);
app.use('/api/assess', assessRoutes);
app.use('/api/badge', badgeRoutes);
// app.use('/api/arena', arenaRoutes);
app.use('/api/puzzle', puzzleRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/cv', cvRoutes);

// GET /api/skills — Get available skill categories
app.get('/api/skills', (req, res) => {
    res.json(getSkillCategories());
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 SkillProof server running on port ${PORT}`);
    console.log(`📂 Using JSON file storage in server/data/`);
});

module.exports = app;
