function getProjectVerificationPrompt(projectTitle, techStack, projectDescription, confidenceLevel = 50) {
    let difficulty = "Moderate";
    let difficultyInstructions = "Focus on standard implementation details and core tech stack concepts.";

    if (confidenceLevel <= 25) {
        difficulty = "Basic";
        difficultyInstructions = "Focus on foundational concepts, project setup, and simple feature implementation. Provide some high-level guidance in questions.";
    } else if (confidenceLevel <= 50) {
        difficulty = "Developing Skills";
        difficultyInstructions = "Focus on standard implementation, basic design patterns, and common technical challenges.";
    } else if (confidenceLevel <= 75) {
        difficulty = "Strong Understanding";
        difficultyInstructions = "Focus on advanced architecture, optimization, state management, and robust error handling. Questions should be technical and detailed.";
    } else {
        difficulty = "Challenge Mode (Expert)";
        difficultyInstructions = "Focus on complex system design, scalability bottlenecks, high-performance tuning, and deep technical edge cases. Expect extremely specific and difficult coding logic.";
    }

    return JSON.stringify({
        "role": "system",
        "content": `You are a technical interviewer AI. The candidate has indicated a '${difficulty}' confidence level. ${difficultyInstructions}`
    }) + "\n" + JSON.stringify({
        "role": "user",
        "content": {
            "task": "Generate project verification questions",
            "difficulty_level": difficulty,
            "instructions": [
                "Analyze the project information provided by the candidate.",
                "Generate a high-stakes interview session to verify if the candidate actually built this project.",
                `Tailor the difficulty to: ${difficulty}.`,
                "Focus heavily on coding and direct implementation logic.",
                "Include exactly 2 coding challenges where the candidate must write specific snippets of logic or complex pseudo-code.",
                "The remaining 3 questions must be 'Critical Theory' or 'Architecture' questions that are absolutely vital to the project's tech stack.",
                "Questions should be difficult enough to filter out candidates who only have surface-level knowledge."
            ],
            "project_data": {
                "project_title": projectTitle,
                "tech_stack": techStack,
                "description": projectDescription
            },
            "output_format": {
                "questions": [
                    { "type": "critical_theory", "question": "string" },
                    { "type": "architecture", "question": "string" },
                    { "type": "critical_theory", "question": "string" },
                    { "type": "coding_challenge", "question": "string" },
                    { "type": "coding_challenge", "question": "string" }
                ]
            },
            "rules": [
                "Generate exactly 5 questions.",
                "Prioritize coding and implementation details over generic definitions.",
                "Questions must be highly specific to the provided project description.",
                "Return the exact JSON structure specified in output_format. Do not include markdown blocks."
            ]
        }
    });
}

function getProjectEvaluationPrompt(projectTitle, techStack, questions, answers) {
    const context = questions.map((q, i) => `Q: ${q.question}\nA: ${answers[i] || 'No answer provided.'}`).join('\n\n');
    
    return JSON.stringify({
        "role": "system",
        "content": "You are a senior technical auditor. Your task is to evaluate a candidate's answers to verification questions about their project to determine if they actually built it or are faking it."
    }) + "\n" + JSON.stringify({
        "role": "user",
        "content": {
            "task": "Evaluate project authenticity",
            "project_data": {
                "title": projectTitle,
                "stack": techStack
            },
            "interview_transcript": context,
            "output_format": {
                "authenticityScore": "number (0-100)",
                "confidenceLevel": "Low/Medium/High",
                "verdict": "Verified/Suspicious/Inauthentic",
                "feedback": "Detailed technical reasoning for the verdict",
                "strengths": ["string"],
                "redFlags": ["string"]
            },
            "rules": [
                "Be critical. If answers are generic or buzzword-heavy without implementation details, lower the score.",
                "Look for specific mentions of architectural choices and challenges.",
                "Return exact JSON."
            ]
        }
    });
}

module.exports = { getProjectVerificationPrompt, getProjectEvaluationPrompt };
