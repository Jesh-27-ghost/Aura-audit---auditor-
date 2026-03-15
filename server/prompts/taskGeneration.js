/**
 * Prompt for generating technical assessment tasks using Gemini
 */
const getTaskGenerationPrompt = (skillName, timeLimitMinutes) => {
    return `
You are an expert technical recruiter and senior software architect. 
Your goal is to generate a highly realistic, practical, and time-appropriate technical assessment task for a candidate based on the following:

- **Skill Category**: ${skillName}
- **Time Limit**: ${timeLimitMinutes} minutes

The assessment should be designed to take approximately 70-80% of the allocated time, leaving room for a candidate to think and debug.

### REQUIRED OUTPUT FORMAT (JSON ONLY):
Return ONLY a JSON object with exactly these fields:
1. "title": A concise, professional title for the assessment (e.g., "Build a Secure Node.js AuthService").
2. "description": A high-level explanation of what the candidate needs to build and what problem it solves. Be specific about the requirements.
3. "questions": An array of 3-5 specific sub-tasks or "deliverables" that the candidate must complete during the recording (e.g., ["Implement JWT sign-in", "Add input validation middleware", "Write one unit test"]).

### GUIDELINES:
- **Realism**: The task should mimic real-world work (e.g., "Implement a specific feature in a React app" rather than "Reverse a binary tree").
- **Difficulty**: The task complexity must match the time limit (${timeLimitMinutes} min). 
- **Clarity**: Instructions must be crystal clear so the candidate can start immediately without asking questions.
- **Language/Stack**: If the skill implies a specific stack (e.g., React, Python, C++, SQL), tailor the tasks to that environment.

Return the JSON block directly. No extra talk.
`;
};

module.exports = { getTaskGenerationPrompt };
