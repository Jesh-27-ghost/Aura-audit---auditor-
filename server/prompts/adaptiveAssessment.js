/**
 * Prompt for generating adaptive skill assessments based on candidate profile
 */
const getAdaptiveAssessmentPrompt = (candidateProfile, selectedSkills, testConfig) => {
    const { testType = 'Mixed', numberOfQuestions = 5, timeLimitMinutes = 30 } = testConfig || {};

    // Build skill context from the profile
    const skillContext = selectedSkills.map(skill => {
        const profileSkill = candidateProfile.skills?.find(
            s => s.skillName.toLowerCase() === skill.toLowerCase()
        );
        if (profileSkill) {
            return `- ${profileSkill.skillName}: ${profileSkill.estimatedYears} years experience, ${profileSkill.proficiencyLevel} level. Evidence: "${profileSkill.evidenceFromCV}"`;
        }
        return `- ${skill}: No prior experience found in CV (treat as Beginner)`;
    }).join('\n');

    return `
You are a senior technical interviewer creating a personalized skill assessment.
Generate ${numberOfQuestions} assessment questions/tasks that are precisely calibrated to the candidate's experience level.

### CANDIDATE PROFILE:
- Name: ${candidateProfile.name || 'Unknown'}
- Primary Role: ${candidateProfile.primaryRole || 'Developer'}
- Total Experience: ${candidateProfile.totalYearsExperience || 0} years

### SKILLS TO ASSESS (with experience data from their CV):
${skillContext}

### TIME LIMIT: ${timeLimitMinutes} minutes

### DIFFICULTY MAPPING RULES (STRICTLY FOLLOW):
| Experience | Level | Question Types |
|------------|-------|---------------|
| 0-1 year   | Beginner | Basic MCQ, Terminology, Simple Concepts, "What is X?" |
| 1-3 years  | Junior | Conceptual Questions, Simple Practical Tasks, Code Reading |
| 3-5 years  | Intermediate | Scenario-Based Questions, Debugging Tasks, Applied Problems |
| 5-8 years  | Advanced | Complex Problem Solving, System Design Basics, Optimization |
| 8+ years   | Expert | Architecture Design, Strategy Questions, Advanced Case Studies |

### TEST TYPE PREFERENCE: ${testType}
Available types: MCQ, Coding, Scenario, Debugging, Case Study, Short Answer

### REQUIRED OUTPUT FORMAT (JSON ONLY):
{
  "assessmentTitle": "Adaptive ${selectedSkills[0] || 'Skill'} Assessment",
  "candidateName": "${candidateProfile.name || 'Candidate'}",
  "totalQuestions": ${numberOfQuestions},
  "estimatedDuration": "${timeLimitMinutes} minutes",
  "questions": [
    {
      "questionNumber": 1,
      "skill": "React.js",
      "questionType": "Scenario",
      "difficulty": "Intermediate",
      "basedOnExperience": "3 years",
      "question": "Given a React component that re-renders excessively...",
      "expectedSkillsEvaluated": "React performance optimization, useMemo, useCallback",
      "evaluationCriteria": "Identifies the cause and proposes at least 2 optimization strategies"
    }
  ],
  "difficultyDistribution": {
    "Beginner": 1,
    "Junior": 1,
    "Intermediate": 2,
    "Advanced": 1,
    "Expert": 0
  }
}

### CRITICAL RULES:
1. Each question's difficulty MUST match the candidate's experience in that specific skill.
2. Questions should feel like real interview questions, not textbook exercises.
3. Mix question types for a balanced assessment.
4. Include practical, real-world scenarios over theoretical trivia.
5. The assessment should be completable within the time limit.
6. Return valid JSON only. No extra text.
`;
};

module.exports = { getAdaptiveAssessmentPrompt };
