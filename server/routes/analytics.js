/**
 * Analytics Route
 * GET /api/analytics/candidate — Candidate's own analytics (radar + growth)
 * GET /api/analytics/talent    — Employer talent distribution (bar chart)
 *
 * All data is computed from existing assessments in the JSON store.
 */
const express = require('express');
const { store } = require('../store');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/analytics/candidate
 * Returns the logged-in candidate's performance data for:
 * 1. Radar Chart — latest assessment dimensions vs industry averages
 * 2. Line Chart — score growth over last 5 assessments (learning velocity)
 */
router.get('/candidate', protect, authorize('candidate'), (req, res) => {
    try {
        const userId = req.user._id;

        // Get all assessments for this candidate, sorted by date
        const myAssessments = store.find('assessments', a => a.candidateId === userId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (myAssessments.length === 0) {
            return res.json({
                success: true,
                radarData: [],
                growthData: [],
                stats: { totalAssessments: 0, avgScore: 0, bestScore: 0, passRate: 0 }
            });
        }

        // ── Radar Chart: Latest assessment dimensions vs industry average ──
        const latest = myAssessments[myAssessments.length - 1];
        const dims = latest.dimensions || {};

        // Calculate industry averages from ALL assessments (all users)
        const allAssessments = store.find('assessments');
        const avgCalc = { technicalAccuracy: [], efficiency: [], bestPractices: [], problemSolving: [] };
        allAssessments.forEach(a => {
            if (a.dimensions) {
                for (const key of Object.keys(avgCalc)) {
                    if (a.dimensions[key] && typeof a.dimensions[key].score === 'number') {
                        avgCalc[key].push(a.dimensions[key].score);
                    }
                }
            }
        });
        const industryAvg = {};
        for (const key of Object.keys(avgCalc)) {
            const arr = avgCalc[key];
            industryAvg[key] = arr.length > 0 ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 50;
        }

        const radarData = [
            {
                dimension: 'Technical',
                candidate: dims.technicalAccuracy?.score || 0,
                industryAvg: industryAvg.technicalAccuracy
            },
            {
                dimension: 'Efficiency',
                candidate: dims.efficiency?.score || 0,
                industryAvg: industryAvg.efficiency
            },
            {
                dimension: 'Best Practices',
                candidate: dims.bestPractices?.score || 0,
                industryAvg: industryAvg.bestPractices
            },
            {
                dimension: 'Problem Solving',
                candidate: dims.problemSolving?.score || 0,
                industryAvg: industryAvg.problemSolving
            }
        ];

        // ── Line Chart: Score growth over last 5 assessments ──
        const recentFive = myAssessments.slice(-5);
        const growthData = recentFive.map((a, idx) => ({
            assessment: `#${myAssessments.indexOf(a) + 1}`,
            label: a.skillName ? a.skillName.split(' ').slice(0, 2).join(' ') : `Test ${idx + 1}`,
            score: a.overallScore,
            date: a.createdAt
        }));

        // ── Stats Summary ──
        const scores = myAssessments.map(a => a.overallScore);
        const stats = {
            totalAssessments: myAssessments.length,
            avgScore: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
            bestScore: Math.max(...scores),
            passRate: Math.round((myAssessments.filter(a => a.passed).length / myAssessments.length) * 100)
        };

        res.json({ success: true, radarData, growthData, stats });
    } catch (error) {
        console.error('Analytics candidate error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
    }
});

/**
 * GET /api/analytics/talent?skill=React Frontend Development
 * Returns talent distribution across skill levels for a given technology.
 * Used by the Employer Dashboard bar chart.
 */
router.get('/talent', protect, authorize('employer'), (req, res) => {
    try {
        const { skill } = req.query;
        const allAssessments = store.find('assessments');

        // If a skill filter is provided, filter assessments
        let filtered = skill
            ? allAssessments.filter(a => a.skillName === skill)
            : allAssessments;

        // Only count passed assessments for talent pool
        const passed = filtered.filter(a => a.passed);

        // Count unique candidates per skill level
        const levelMap = { Beginner: new Set(), Intermediate: new Set(), Advanced: new Set(), Expert: new Set() };
        passed.forEach(a => {
            const level = a.skillLevel || 'Beginner';
            if (levelMap[level]) {
                levelMap[level].add(a.candidateId);
            }
        });

        const talentData = [
            { level: 'Beginner', candidates: levelMap.Beginner.size, fill: '#64748b' },
            { level: 'Intermediate', candidates: levelMap.Intermediate.size, fill: '#10b981' },
            { level: 'Advanced', candidates: levelMap.Advanced.size, fill: '#6366f1' },
            { level: 'Expert', candidates: levelMap.Expert.size, fill: '#f59e0b' }
        ];

        // Get list of all unique skills for the filter dropdown
        const allSkills = [...new Set(allAssessments.map(a => a.skillName))].sort();

        res.json({ success: true, talentData, availableSkills: allSkills, filterApplied: skill || 'All Skills' });
    } catch (error) {
        console.error('Analytics talent error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch talent data', error: error.message });
    }
});

/**
 * GET /api/analytics/skill-progress
 * Returns per-skill progress data for the logged-in candidate.
 * Groups all assessments by skillName and returns time-series
 * of { attempt, date, score, level } for each skill.
 *
 * Response format:
 * {
 *   skills: {
 *     "React Frontend Development": [
 *       { attempt: 1, date: "2026-03-05", score: 72, level: "Intermediate" },
 *       { attempt: 2, date: "2026-03-08", score: 85, level: "Advanced" }
 *     ],
 *     "Python Backend": [ ... ]
 *   },
 *   skillList: ["React Frontend Development", "Python Backend"]
 * }
 */
router.get('/skill-progress', protect, authorize('candidate'), (req, res) => {
    try {
        const userId = req.user._id;

        const myAssessments = store.find('assessments', a => a.candidateId === userId)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (myAssessments.length === 0) {
            return res.json({ success: true, skills: {}, skillList: [] });
        }

        // Group by skill name
        const grouped = {};
        myAssessments.forEach(a => {
            const skill = a.skillName || 'Unknown';
            if (!grouped[skill]) grouped[skill] = [];
            grouped[skill].push(a);
        });

        // Build time-series per skill
        const skills = {};
        for (const [skillName, assessments] of Object.entries(grouped)) {
            skills[skillName] = assessments.map((a, idx) => ({
                attempt: idx + 1,
                date: a.createdAt
                    ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : `Attempt ${idx + 1}`,
                fullDate: a.createdAt || null,
                score: a.overallScore || 0,
                level: a.skillLevel || 'Beginner',
                passed: !!a.passed,
            }));
        }

        const skillList = Object.keys(skills).sort();

        res.json({ success: true, skills, skillList });
    } catch (error) {
        console.error('Skill progress error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch skill progress', error: error.message });
    }
});

module.exports = router;
