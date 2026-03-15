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
const leaderboardRoutes = require('./routes/leaderboard');
const analyticsRoutes = require('./routes/analytics');
const puzzleRoutes = require('./routes/puzzle');
const taskRoutes = require('./routes/tasks');
const taskSubmissionRoutes = require('./routes/task-submissions');
const { getSkillCategories } = require('./prompts/skillRubrics');

app.use('/api/auth', authRoutes);
app.use('/api/assess', assessRoutes);
app.use('/api/badge', badgeRoutes);
// app.use('/api/arena', arenaRoutes);
app.use('/api/puzzle', puzzleRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/task-submissions', taskSubmissionRoutes);


// GET /api/skills — Get available skill categories
app.get('/api/skills', (req, res) => {
    res.json(getSkillCategories());
});

// GET /api/skills/search — Search skills with candidate counts (for employer search bar)
app.get('/api/skills/search', (req, res) => {
    try {
        const { q } = req.query;
        const { store } = require('./store');

        // Get all passed assessments
        const assessments = store.find('assessments', (a) => a.passed === true);

        // Aggregate skills with unique candidate counts
        const skillMap = {};
        for (const a of assessments) {
            const skillName = a.skillName;
            if (!skillMap[skillName]) {
                skillMap[skillName] = { name: skillName, candidates: new Set(), industry: a.industry || '' };
            }
            skillMap[skillName].candidates.add(a.candidateId);
        }

        // Also include all skill categories (even those with 0 candidates)
        const categories = getSkillCategories();
        for (const cat of categories) {
            if (!skillMap[cat.name]) {
                skillMap[cat.name] = { name: cat.name, candidates: new Set(), industry: cat.industry };
            }
        }

        // Convert Sets to counts and apply search filter
        let skills = Object.values(skillMap).map(s => ({
            name: s.name,
            candidates: s.candidates.size,
            industry: s.industry
        }));

        // Filter by query if provided (case-insensitive, partial match)
        if (q && q.trim()) {
            const query = q.trim().toLowerCase();
            skills = skills.filter(s => s.name.toLowerCase().includes(query));
        }

        // Sort by candidate count descending by default
        skills.sort((a, b) => b.candidates - a.candidates);

        res.json(skills);
    } catch (error) {
        console.error('Skills search error:', error);
        res.status(500).json({ message: 'Failed to search skills', error: error.message });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 SkillBuster server running on port ${PORT}`);
    console.log(`📂 Using JSON file storage in server/data/`);
});

module.exports = app;
