/**
 * Leaderboard Route
 * GET /api/leaderboard — Returns top 10 users sorted by their highest assessment score
 * 
 * How it works:
 * 1. Reads all assessments from the JSON file store
 * 2. Groups assessments by candidateId to find each user's best score
 * 3. Looks up the username from the users collection
 * 4. Sorts by highest score (descending) and returns the top 10
 * 
 * No authentication required — the leaderboard is public!
 */
const express = require('express');
const { store } = require('../store');

const router = express.Router();

// GET /api/leaderboard — Get the top 10 performers
router.get('/', (req, res) => {
    try {
        // Step 1: Read all assessments from the store
        const assessments = store.find('assessments');

        // Step 2: Read all users so we can map candidateId → username
        const users = store.find('users');

        // Build a quick lookup: userId → userName
        const userMap = {};
        users.forEach((user) => {
            userMap[user._id] = user.name;
        });

        // Step 3: For each user, find their BEST assessment (highest overallScore)
        // We use a map keyed by candidateId to deduplicate
        const bestByUser = {};

        assessments.forEach((assessment) => {
            const uid = assessment.candidateId;

            // Only consider assessments that have a valid score
            if (typeof assessment.overallScore !== 'number') return;

            // If this user isn't tracked yet, or this score beats their current best
            if (
                !bestByUser[uid] ||
                assessment.overallScore > bestByUser[uid].overallScore
            ) {
                bestByUser[uid] = {
                    candidateId: uid,
                    username: userMap[uid] || 'Unknown User',
                    skillName: assessment.skillName || 'Untitled Skill',
                    overallScore: assessment.overallScore,
                    skillLevel: assessment.skillLevel || 'Beginner',
                    industry: assessment.industry || '',
                    uploadDate: assessment.createdAt
                };
            }
        });

        // Step 4: Convert the map to an array, sort by score descending, take top 10
        const leaderboard = Object.values(bestByUser)
            .sort((a, b) => b.overallScore - a.overallScore)
            .slice(0, 10)
            .map((entry, index) => ({
                rank: index + 1,           // 1-based rank
                username: entry.username,
                skillName: entry.skillName,
                score: entry.overallScore,
                skillLevel: entry.skillLevel,
                industry: entry.industry,
                uploadDate: entry.uploadDate
            }));

        // Step 5: Send the response
        res.json({
            success: true,
            count: leaderboard.length,
            data: leaderboard
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaderboard',
            error: error.message
        });
    }
});

module.exports = router;
