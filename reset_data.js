const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'server', 'data');

const resetFile = (filename, updateFn) => {
    const filePath = path.join(dataDir, filename);
    if (!fs.existsSync(filePath)) return;
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const updated = data.map(updateFn);
        fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
        console.log(`Reset ${filename} successfully.`);
    } catch (err) {
        console.error(`Failed to reset ${filename}:`, err);
    }
};

// Reset Assessments
resetFile('assessments.json', (a) => ({
    ...a,
    overallScore: 0,
    passed: false,
    skillLevel: 'Beginner',
    dimensions: Object.fromEntries(
        Object.entries(a.dimensions || {}).map(([key, val]) => [key, { ...val, score: 0, observation: 'No data' }])
    )
}));

// Reset Puzzle Sessions
resetFile('puzzleSessions.json', (p) => ({
    ...p,
    metrics: {
        reasoning: 0,
        patternRecognition: 0,
        speed: 0,
        flexibility: 0
    }
}));

// Reset Badges
resetFile('badges.json', (b) => ({
    ...b,
    overallScore: 0,
    skillLevel: 'Beginner'
}));
