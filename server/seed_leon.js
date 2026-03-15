const { store, generateId } = require('./store');
const { v4: uuidv4 } = require('uuid');

const LEON_ID = 'mmi4rk44-gmin4tlz3';
const LEON_NAME = 'leon';

const assessments = [
  {
    candidateId: LEON_ID,
    skillName: 'React Frontend Development',
    industry: 'Software Engineering',
    passed: true,
    overallScore: 85,
    skillLevel: 'Advanced',
    verifiedSkills: ['React Hooks', 'State Management', 'Component Architecture'],
    employerSummary: 'Strong understanding of React fundamentals and advanced patterns. Excellent state management.',
    dimensions: {
      technicalCorrectness: { score: 88, observation: 'Wrote clean, bug-free components.' },
      depthOfKnowledge: { score: 82, observation: 'Demonstrated deep knowledge of React lifecycle.' },
      problemSolving: { score: 85, observation: 'Resolved edge cases efficiently.' },
      communication: { score: 85, observation: 'Clear explanations.' }
    },
    strengths: ['Component design', 'React Hooks'],
    improvements: ['Testing'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    candidateId: LEON_ID,
    skillName: 'React Frontend Development',
    industry: 'Software Engineering',
    passed: true,
    overallScore: 92,
    skillLevel: 'Expert',
    verifiedSkills: ['Performance Optimization', 'Custom Hooks', 'React Context'],
    employerSummary: 'Exceptional performance optimization skills. Built highly reusable custom hooks.',
    dimensions: {
      technicalCorrectness: { score: 95, observation: 'Flawless execution.' },
      depthOfKnowledge: { score: 90, observation: 'Very deep understanding.' },
      problemSolving: { score: 92, observation: 'Creative problem solving.' },
      communication: { score: 90, observation: 'Excellent articulation.' }
    },
    strengths: ['Performance', 'Context API'],
    improvements: ['Accessibility'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    candidateId: LEON_ID,
    skillName: 'Node.js API Development',
    industry: 'Software Engineering',
    passed: true,
    overallScore: 78,
    skillLevel: 'Intermediate',
    verifiedSkills: ['Express.js', 'REST APIs', 'Middleware'],
    employerSummary: 'Solid API development skills. Good understanding of middleware and routing.',
    dimensions: {
      technicalCorrectness: { score: 80, observation: 'Good API structure.' },
      depthOfKnowledge: { score: 75, observation: 'Solid basics.' },
      problemSolving: { score: 78, observation: 'Handled standard problems well.' },
      communication: { score: 80, observation: 'Good documentation.' }
    },
    strengths: ['Routing', 'Middleware'],
    improvements: ['Error handling', 'Security best practices'],
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
