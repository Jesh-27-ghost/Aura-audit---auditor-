const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { store } = require('../store');

const router = express.Router();

// GET /api/candidates — Search candidates by skill, score, level (employer only)
router.get('/', protect, authorize('employer'), (req, res) => {
    try {
        const { skill, minScore, level } = req.query;

        let assessments = store.find('assessments', (a) => {
            if (!a.passed) return false;
            if (skill && !a.skillName.toLowerCase().includes(skill.toLowerCase())) return false;
            if (minScore && a.overallScore < parseInt(minScore)) return false;
            if (level && a.skillLevel !== level) return false;
            return true;
        });

        // Sort by score descending
        assessments.sort((a, b) => b.overallScore - a.overallScore);

        // Limit to 50
        assessments = assessments.slice(0, 50);

        // Build response with candidate info and badge
        const candidates = [];
        const seen = new Set();

        for (const assessment of assessments) {
            const candidateKey = assessment.candidateId + assessment.skillName;
            if (seen.has(candidateKey)) continue;
            seen.add(candidateKey);

            const user = store.findById('users', assessment.candidateId);
            if (!user) continue;

            const badge = store.findOne('badges', (b) => b.assessmentId === assessment._id);
/*
            const arenaSessions = store.find('arenaSessions', (s) => s.candidateId === assessment.candidateId);
            const topArenaSession = arenaSessions.length > 0 
                ? arenaSessions.reduce((prev, current) => (prev.score > current.score) ? prev : current)
                : null;
*/

            const puzzleSessions = store.find('puzzleSessions', (s) => s.candidateId === assessment.candidateId && s.completed);
            const topPuzzleSession = puzzleSessions.length > 0
                ? puzzleSessions.reduce((prev, current) => (prev.metrics.reasoning > current.metrics.reasoning) ? prev : current)
                : null;

            candidates.push({
                candidate: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    bio: user.bio || ''
                },
                assessment: {
                    id: assessment._id,
                    skillName: assessment.skillName,
                    industry: assessment.industry,
                    overallScore: assessment.overallScore,
                    skillLevel: assessment.skillLevel,
                    verifiedSkills: assessment.verifiedSkills,
                    dimensions: assessment.dimensions,
                    strengths: assessment.strengths,
                    improvements: assessment.improvements,
                    employerSummary: assessment.employerSummary,
                    createdAt: assessment.createdAt
                },
/*
                arena: topArenaSession ? {
                    score: topArenaSession.score,
                    accuracy: topArenaSession.accuracy,
                    timeTaken: topArenaSession.timeTaken,
                    level: topArenaSession.level
                } : null,
*/
                puzzle: topPuzzleSession ? {
                    metrics: topPuzzleSession.metrics
                } : null,
                badgeId: badge ? badge.badgeId : null
            });
        }

        res.json(candidates);
    } catch (error) {
        console.error('Candidates search error:', error);
        res.status(500).json({ message: 'Failed to search candidates', error: error.message });
    }
});

module.exports = router;
