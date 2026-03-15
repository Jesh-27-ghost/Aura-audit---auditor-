const { store, generateId } = require('./store');
const { v4: uuidv4 } = require('uuid');

const LEON_ID = 'mmi4rk44-gmin4tlz3';
const LEON_NAME = 'leon';

const assessments = [
  {
    candidateId: LEON_ID,
    skillName: 'React Frontend Development',
    industry: 'Software Engineering',
    passed: false,
    overallScore: 0,
    skillLevel: 'Beginner',
    verifiedSkills: ['React Hooks', 'State Management', 'Component Architecture'],
    employerSummary: 'Assessment initiated but no progress demonstrated.',
    dimensions: {
      technicalCorrectness: { score: 0, observation: 'No evidence provided.' },
      depthOfKnowledge: { score: 0, observation: 'No evidence provided.' },
      problemSolving: { score: 0, observation: 'No evidence provided.' },
      communication: { score: 0, observation: 'No evidence provided.' }
    },
    strengths: [],
    improvements: ['Complete the assessment'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    candidateId: LEON_ID,
    skillName: 'React Frontend Development',
    industry: 'Software Engineering',
    passed: false,
    overallScore: 0,
    skillLevel: 'Beginner',
    verifiedSkills: ['Performance Optimization', 'Custom Hooks', 'React Context'],
    employerSummary: 'Assessment initiated but no progress demonstrated.',
    dimensions: {
      technicalCorrectness: { score: 0, observation: 'No evidence provided.' },
      depthOfKnowledge: { score: 0, observation: 'No evidence provided.' },
      problemSolving: { score: 0, observation: 'No evidence provided.' },
      communication: { score: 0, observation: 'No evidence provided.' }
    },
    strengths: [],
    improvements: ['Complete the assessment'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    candidateId: LEON_ID,
    skillName: 'Node.js API Development',
    industry: 'Software Engineering',
    passed: false,
    overallScore: 0,
    skillLevel: 'Beginner',
    verifiedSkills: ['Express.js', 'REST APIs', 'Middleware'],
    employerSummary: 'Assessment initiated but no progress demonstrated.',
    dimensions: {
      technicalCorrectness: { score: 0, observation: 'No evidence provided.' },
      depthOfKnowledge: { score: 0, observation: 'No evidence provided.' },
      problemSolving: { score: 0, observation: 'No evidence provided.' },
      communication: { score: 0, observation: 'No evidence provided.' }
    },
    strengths: [],
    improvements: ['Complete the assessment'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

let added = 0;
for (const a of assessments) {
  const assessment = store.insert('assessments', a);
  store.insert('badges', {
    badgeId: uuidv4(),
    candidateId: LEON_ID,
    assessmentId: assessment._id,
    candidateName: LEON_NAME,
    skillName: assessment.skillName,
    industry: assessment.industry,
    overallScore: assessment.overallScore,
    skillLevel: assessment.skillLevel,
    verifiedSkills: assessment.verifiedSkills,
    employerSummary: assessment.employerSummary,
    issuedAt: assessment.createdAt
  });
  added++;
}

console.log('Successfully seeded ' + added + ' assessments and badges for leon.');
