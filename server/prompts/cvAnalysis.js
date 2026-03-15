/**
 * Prompt for AI-powered CV parsing and skill extraction
 */
const getCVAnalysisPrompt = (cvText) => {
    return `
You are an expert technical recruiter and HR analyst with 15+ years of experience.
Analyze the following CV/resume text and extract a comprehensive, structured skill profile.

### CV TEXT:
"""
${cvText}
"""

### INSTRUCTIONS:
1. Extract ALL technical and soft skills mentioned or implied.
2. For each skill, estimate years of experience based on:
   - Explicit mentions of duration
   - Project timelines and work history dates
   - Depth of usage described in projects
3. Classify each skill's proficiency level using these rules:
   - **Beginner** (0-1 years): Basic exposure, coursework, or tutorial-level usage
   - **Intermediate** (1-3 years): Used in real projects, understands core concepts
   - **Advanced** (3-5 years): Deep expertise, led implementations, complex usage
   - **Expert** (5+ years): Industry-level mastery, architectural decisions, mentoring others
4. Provide evidence from the CV text that supports each skill assessment.
5. Identify the candidate's primary role/title and industry domain.

### REQUIRED OUTPUT FORMAT (JSON ONLY):
Return ONLY a valid JSON object with this exact structure:
{
  "name": "Candidate's full name",
  "primaryRole": "Most likely job title (e.g., Full Stack Developer)",
  "industryDomain": "Primary industry (e.g., FinTech, E-commerce, Healthcare)",
  "totalYearsExperience": 5,
  "education": [
    {
      "degree": "B.Tech in Computer Science",
      "institution": "University Name",
      "year": "2020"
    }
  ],
  "skills": [
    {
      "skillName": "React.js",
      "category": "Frontend",
      "estimatedYears": 3,
      "proficiencyLevel": "Advanced",
      "evidenceFromCV": "Led the frontend team building a React dashboard for 2 years at XYZ Corp, also used in 3 personal projects"
    }
  ],
  "certifications": ["AWS Solutions Architect", "Google Cloud Professional"],
  "notableProjects": [
    {
      "name": "E-commerce Platform",
      "technologies": ["React", "Node.js", "MongoDB"],
      "description": "Built a full-stack e-commerce platform with payment integration"
    }
  ],
  "summary": "Brief 2-3 sentence professional summary of the candidate"
}

### GUIDELINES:
- Group skills into categories: Frontend, Backend, Database, DevOps, Mobile, AI/ML, Soft Skills, etc.
- Be conservative with experience estimates — don't inflate.
- If dates are ambiguous, use the lower estimate.
- Include programming languages, frameworks, tools, databases, cloud platforms, and methodologies.
- Return valid JSON only. No extra text, no markdown fences.
`;
};

module.exports = { getCVAnalysisPrompt };
