const bcrypt = require('bcryptjs');
const { store } = require('./store');
const { v4: uuidv4 } = require('uuid');

const SKILLS = [
  'React Frontend Development',
  'Node.js API Development',
  'JavaScript Debugging',
  'SQL Database Querying',
  'Python Scripting',
  'DevOps / Docker',
  'C++ Scripting'
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy', 'Nicholas', 'Shirley', 'Eric', 'Angela', 'Stephen', 'Helen', 'Jonathan', 'Anna', 'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma', 'Frank', 'Samantha', 'Benjamin', 'Katherine', 'Gregory', 'Christine', 'Samuel', 'Debra', 'Raymond', 'Rachel', 'Patrick', 'Carolyn', 'Alexander', 'Janet', 'Jack', 'Catherine', 'Dennis', 'Maria', 'Jerry', 'Heather'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];

function getRandomName() {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const l = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${f} ${l}`;
}

async function seed() {
  console.log('Starting comprehensive bot seeding...');
  
  // Clear existing assessment/badge data to ensure specific constraints
  store.deleteAll('assessments');
  store.deleteAll('badges');
  store.deleteAll('puzzleSessions');
  store.deleteAll('users');
  
  const password = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const expertFields = [
    { skill: 'React Frontend Development', name: 'Arjun Mehta', score: 94 },
    { skill: 'Node.js API Development', name: 'Elena Rodriguez', score: 92 },
    { skill: 'Python Scripting', name: 'Sarah Chen', score: 95 }
  ];

  const bots = [];

  // 1. Create 3 Experts
  for (const exp of expertFields) {
    bots.push({
      name: exp.name,
      email: exp.name.toLowerCase().replace(' ', '.') + '@bot.com',
      skill: exp.skill,
      level: 'Expert',
      score: exp.score
    });
  }

  // 2. Create 2 per level per field for the "rest"
  for (const skill of SKILLS) {
    for (const level of LEVELS) {
      for (let i = 0; i < 2; i++) {
        const name = getRandomName();
        // Give randomized scores based on level
        let score;
        if (level === 'Beginner') score = Math.floor(Math.random() * 20) + 50; // 50-69
        if (level === 'Intermediate') score = Math.floor(Math.random() * 10) + 70; // 70-79
        if (level === 'Advanced') score = Math.floor(Math.random() * 10) + 80; // 80-89

        bots.push({
          name,
          email: name.toLowerCase().replace(' ', '.') + '.' + i + '@bot.com',
          skill,
          level,
          score
        });
      }
    }
  }

  console.log(`Generating ${bots.length} bots...`);

  for (const bot of bots) {
    const bios = [
      `${bot.level} level professional specializing in ${bot.skill}. Passionate about building scalable systems.`,
      `Experienced in ${bot.skill} with a focus on ${bot.level === 'Expert' ? 'architecture and leadership' : 'clean code and performance'}.`,
      `Creative developer with a strong foundation in ${bot.skill}. Currently working at the ${bot.level} level.`,
      `Tech enthusiast and ${bot.skill} specialist. Demonstrated ${bot.level} proficiency in recent assessments.`,
      `Full-stack developer with a deep dive into ${bot.skill}. Always learning and improving.`
    ];
    const bio = bios[Math.floor(Math.random() * bios.length)];

    const user = store.insert('users', {
      name: bot.name,
      email: bot.email,
      password: hashedPassword,
      role: 'candidate',
      bio: bio,
      skills: [bot.skill]
    });

    const isPassed = bot.score >= 70;

    const assessment = store.insert('assessments', {
      candidateId: user._id,
      skillName: bot.skill,
      industry: 'IT / Software',
      passed: isPassed,
      overallScore: bot.score,
      skillLevel: bot.level,
      verifiedSkills: [bot.skill, 'Problem Solving', 'Technical Documentation'],
      employerSummary: generateSummary(bot.name, bot.skill, bot.level, bot.score),
      dimensions: generateDimensions(bot.score, bot.level),
      strengths: generateStrengths(bot.skill, bot.level),
      improvements: generateImprovements(bot.skill, bot.level),
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
    });

    if (isPassed) {
      store.insert('badges', {
        badgeId: uuidv4(),
        candidateId: user._id,
        assessmentId: assessment._id,
        candidateName: user.name,
        skillName: assessment.skillName,
        industry: assessment.industry,
        overallScore: assessment.overallScore,
        skillLevel: assessment.skillLevel,
        verifiedSkills: assessment.verifiedSkills,
        employerSummary: assessment.employerSummary,
        issuedAt: assessment.createdAt
      });
    }

    // Add detailed puzzle metrics
    store.insert('puzzleSessions', {
      candidateId: user._id,
      completed: true,
      metrics: {
        reasoning: (bot.score / 10 + (Math.random() * 2 - 1)).toFixed(1),
        patternRecognition: (bot.score / 10 + (Math.random() * 2 - 1)).toFixed(1),
        speed: (bot.score / 10 + (Math.random() * 2 - 1)).toFixed(1),
        flexibility: (bot.score / 10 + (Math.random() * 2 - 1)).toFixed(1)
      },
      createdAt: assessment.createdAt
    });
  }

  console.log('Seeding complete!');
}

function generateSummary(name, skill, level, score) {
  if (level === 'Expert') {
    return `${name} demonstrated exceptional mastery in ${skill}. Their solution was architecturally sound, highly optimized, and followed every industry best practice. They are clearly ready for senior-level responsibilities.`;
  }
  if (level === 'Advanced') {
    return `${name} showed a strong command of ${skill}. The code was clean and efficient, with only minor stylistic improvements suggested. They possess a solid foundation for building complex systems.`;
  }
  if (level === 'Intermediate') {
    return `${name} is proficient in ${skill} and can handle standard tasks independently. While the core logic was correct, they would benefit from more focus on performance optimization and advanced patterns.`;
  }
  return `${name} has a basic understanding of ${skill}. They were able to complete the fundamental tasks but struggled with some of the more complex requirements. Good potential with further training.`;
}

function generateDimensions(score, level) {
  const base = score;
  return {
    technicalCorrectness: { 
      score: Math.min(100, Math.max(0, base + Math.floor(Math.random() * 6 - 3))),
      observation: score > 80 ? 'Flawless execution of core logic.' : 'Good understanding, minor edge cases missed.'
    },
    depthOfKnowledge: { 
      score: Math.min(100, Math.max(0, base + Math.floor(Math.random() * 6 - 3))),
      observation: score > 90 ? 'Expert grasp of advanced concepts.' : 'Solid understanding of fundamental principles.'
    },
    problemSolving: { 
      score: Math.min(100, Math.max(0, base + Math.floor(Math.random() * 6 - 3))),
      observation: 'Logical approach taken to resolve the task.'
    },
    communication: { 
      score: Math.min(100, Math.max(0, base + Math.floor(Math.random() * 6 - 3))),
      observation: 'Clear articulation of the thought process during the demonstration.'
    }
  };
}

function generateStrengths(skill, level) {
  const generic = ['Clean Code', 'Logical Reasoning', 'Documentation'];
  if (skill.includes('React')) return [...generic, 'Hook Composition', 'Component Lifecycle'];
  if (skill.includes('Node')) return [...generic, 'Middleware Design', 'Async/Await Patterns'];
  if (skill.includes('Python')) return [...generic, 'Data Structures', 'Idiomatic Python'];
  return generic;
}

function generateImprovements(skill, level) {
  if (level === 'Expert') return ['Explore even more niche optimizations', 'Contributing to open source in this area'];
  if (level === 'Advanced') return ['Performance profiling', 'Advanced security patterns'];
  return ['Unit testing coverage', 'More thorough error handling', 'Modularization of logic'];
}

seed().catch(console.error);
