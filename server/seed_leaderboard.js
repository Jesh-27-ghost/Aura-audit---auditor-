/**
 * Specialized Seed Script for Leaderboard Bot Data
 * Requirements:
 * 1. 3 Experts (Score <= 97)
 * 2. 3 for each difficulty (Beginner, Intermediate, Advanced) for EACH skill.
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { store } = require('./store');
const { getSkillCategories } = require('./prompts/skillRubrics');

const seedLeaderboard = async () => {
    try {
        console.log('🤖 Generating Bot Data for Leaderboard...\n');

        // Clear existing data
        store.deleteAll('users');
        store.deleteAll('assessments');
        store.deleteAll('badges');
        console.log('Cleared existing data');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const skills = getSkillCategories().map(s => s.name);
        const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
        
        // 1. Create Experts (Total 3 across the platform)
        const experts = [
            { name: 'Dr. Sarah Connor', skill: 'React Frontend Development', score: 97, industry: 'IT / Software' },
            { name: 'Marcus Wright', skill: 'Node.js API Development', score: 96, industry: 'IT / Software' },
            { name: 'Kyle Reese', skill: 'JavaScript Debugging', score: 96, industry: 'IT / Software' }
        ];

        experts.forEach(exp => {
            const user = store.insert('users', {
                name: exp.name,
                email: `${exp.name.toLowerCase().replace(/ /g, '.')}@bot.com`,
                password: hashedPassword,
                role: 'candidate',
                bio: 'Expert level bot candidate'
            });

            createAssessmentAndBadge(user, exp.skill, exp.industry, exp.score, 'Expert');
        });

        // 2. Create 3 bots for each difficulty for EACH skill
        skills.forEach(skillName => {
            const industry = getSkillCategories().find(s => s.name === skillName)?.industry || 'IT / Software';
            
            difficulties.forEach(diff => {
                for (let i = 1; i <= 3; i++) {
                    const score = getScoreForDifficulty(diff);
                    const name = `${diff} Bot ${i} - ${skillName.split(' ')[0]}`;
                    
                    const user = store.insert('users', {
                        name: name,
                        email: `${name.toLowerCase().replace(/ /g, '.')}@bot.com`,
                        password: hashedPassword,
                        role: 'candidate',
                        bio: `Automated ${diff} bot for testing`
                    });

                    createAssessmentAndBadge(user, skillName, industry, score, diff);
                }
            });
        });

        // Add one main employer for testing
        store.insert('users', {
            name: 'SkillBuster Admin',
            email: 'admin@skillbuster.io',
            password: hashedPassword,
            role: 'employer',
            bio: 'Lead Overseer'
        });

        console.log('\n✅ Leaderboard population complete!');
        console.log(`Skills processed: ${skills.length}`);
        console.log(`Total Bots created: ${3 + (skills.length * 3 * 3)}`);

    } catch (error) {
        console.error('Bot generation error:', error);
    }
};

function getScoreForDifficulty(diff) {
    if (diff === 'Beginner') return 60 + Math.floor(Math.random() * 11); // 60-70
    if (diff === 'Intermediate') return 71 + Math.floor(Math.random() * 15); // 71-85
    if (diff === 'Advanced') return 86 + Math.floor(Math.random() * 10); // 86-95
    return 0;
}

function createAssessmentAndBadge(user, skillName, industry, score, level) {
    const assessment = store.insert('assessments', {
        candidateId: user._id,
        skillName,
        industry,
        overallScore: score,
        passed: score >= 70, // Beginner bots might fail if < 70, but I'll make them 60-70 as requested
        skillLevel: level,
        dimensions: {
            technicalAccuracy: { score, observation: 'Consistent performance for this level.' },
            efficiency: { score: score - 5, observation: 'Good approach.' },
            bestPractices: { score: score - 2, observation: 'Followed basic guidelines.' },
            problemSolving: { score, observation: 'Standard solutioning.' }
        },
        strengths: ['Consistent behavior', 'Accuracy'],
        improvements: ['Could be more complex'],
        employerSummary: 'Bot data for testing.',
        verifiedSkills: [skillName],
        videoPath: ''
    });

    if (score >= 70) {
        const badge = store.insert('badges', {
            badgeId: uuidv4(),
            candidateId: user._id,
            assessmentId: assessment._id,
            candidateName: user.name,
            skillName,
            industry,
            overallScore: score,
            skillLevel: level,
            verifiedSkills: [skillName],
            issuedAt: new Date().toISOString()
        });
        store.updateById('assessments', assessment._id, { badgeId: badge._id });
    }
}

seedLeaderboard();
