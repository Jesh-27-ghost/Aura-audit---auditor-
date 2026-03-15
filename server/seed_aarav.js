const { store } = require('./store');
const { v4: uuidv4 } = require('uuid');

async function seedAarav() {
    const aarav = store.findOne('users', (u) => u.email === 'aarav@example.com');
    if (!aarav) {
        console.error('Candidate Aarav not found!');
        return;
    }

    const AARAV_ID = aarav._id;
    const AARAV_NAME = aarav.name;

    const assessments = [
        {
            candidateId: AARAV_ID,
            skillName: 'React Frontend Development',
            industry: 'Software Engineering',
            passed: false,
            overallScore: 0,
            skillLevel: 'Beginner',
            verifiedSkills: ['React Basics', 'HTML/CSS', 'Component Structure'],
            employerSummary: 'Demo assessment with 0 score (not yet completed).',
            dimensions: {
                technicalCorrectness: { score: 0, observation: 'Pending completion.' },
                depthOfKnowledge: { score: 0, observation: 'Pending completion.' },
                problemSolving: { score: 0, observation: 'Pending completion.' },
                communication: { score: 0, observation: 'Pending completion.' }
            },
            strengths: [],
            improvements: ['Needs to record a session.'],
            createdAt: new Date().toISOString()
        }
    ];

    for (const a of assessments) {
        const assessment = store.insert('assessments', a);
        store.insert('badges', {
            badgeId: uuidv4(),
            candidateId: AARAV_ID,
            assessmentId: assessment._id,
            candidateName: AARAV_NAME,
            skillName: assessment.skillName,
            industry: assessment.industry,
            overallScore: assessment.overallScore,
            skillLevel: assessment.skillLevel,
            verifiedSkills: assessment.verifiedSkills,
            employerSummary: assessment.employerSummary,
            issuedAt: assessment.createdAt
        });
    }
    console.log('Dummy data seeded for Aarav successfully.');
}

seedAarav().catch(console.error);
