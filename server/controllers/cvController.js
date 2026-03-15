const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const { store } = require('../store');
const { getCVAnalysisPrompt } = require('../prompts/cvAnalysis');
const { getAdaptiveAssessmentPrompt } = require('../prompts/adaptiveAssessment');

// Same robust priority list as taskController
const MODEL_PRIORITY = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiText(prompt, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError = null;
    const MAX_RETRIES = 4;

    for (const modelName of MODEL_PRIORITY) {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`🤖 [CV/TestAI] Trying model: ${modelName} (attempt ${attempt}/${MAX_RETRIES})...`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const result = await model.generateContent(prompt);
                const response = await result.response;
                let responseText = response.text();
                console.log(`✅ [CV/TestAI] ${modelName} responded successfully`);

                responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                return { data: JSON.parse(responseText), model: modelName };
            } catch (err) {
                lastError = err;
                console.warn(`⚠️ [CV/TestAI] ${modelName} attempt ${attempt} failed: ${err.message?.substring(0, 150)}`);

                const isNotFound = err.status === 404 || err.message?.includes('404') || err.message?.includes('not found');
                if (isNotFound) {
                    console.warn(`⚠️ [CV/TestAI] Model ${modelName} not available, skipping...`);
                    break;
                }

                const isQuota = err.message?.includes('429') ||
                    err.message?.includes('quota') ||
                    err.message?.includes('rate') ||
                    err.status === 429;

                const isOverloaded = err.status === 503 || err.message?.includes('503');

                if ((isQuota || isOverloaded) && attempt < MAX_RETRIES) {
                    const waitSec = 15 * attempt;
                    console.log(`⏳ [CV/TestAI] Rate limited/Overloaded. Waiting ${waitSec}s...`);
                    await sleep(waitSec * 1000);
                    continue;
                }
                break;
            }
        }
    }
    throw lastError || new Error('All Gemini models failed');
}

/**
 * Handle CV Upload & Parsing via Gemini
 * POST /api/cv/upload
 */
const uploadCV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No CV file provided' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
        }

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📄 CV Upload: Candidate ${req.user.name} (${req.file.originalname})`);

        let extractedText = '';

        // Extract text depending on file type
        if (req.file.mimetype === 'application/pdf') {
            const pdfData = await pdfParse(req.file.buffer);
            extractedText = pdfData.text;
        } else {
            // For txt or plain content
            extractedText = req.file.buffer.toString('utf8');
        }

        if (!extractedText || extractedText.trim().length < 50) {
            return res.status(400).json({ message: 'Could not extract enough readable text from the CV' });
        }

        console.log(`🧠 Extracted ${extractedText.length} characters. Sending to Gemini for analysis...`);

        // Send to Gemini
        const prompt = getCVAnalysisPrompt(extractedText);
        const result = await callGeminiText(prompt, process.env.GEMINI_API_KEY);
        const profileData = result.data;

        // Upsert into store (1 profile per candidate)
        const existingProfileInfo = store.findOne('cv_profiles', p => p.candidateId === req.user._id);
        
        let profileRecord;
        if (existingProfileInfo) {
            profileRecord = store.updateById('cv_profiles', existingProfileInfo._id, {
                parsedData: profileData,
                lastUpdated: new Date().toISOString(),
                analyzedBy: result.model
            });
            console.log(`✅ CV Profile updated for ${req.user.name}`);
        } else {
            profileRecord = store.insert('cv_profiles', {
                candidateId: req.user._id,
                candidateName: req.user.name,
                parsedData: profileData,
                analyzedBy: result.model
            });
            console.log(`✅ CV Profile created for ${req.user.name}`);
        }
        console.log('='.repeat(60) + '\n');

        res.status(200).json({
            message: 'CV analyzed successfully',
            profile: profileRecord
        });

    } catch (error) {
        console.error('❌ CV Upload/Analysis error:', error);
        res.status(500).json({ 
            message: 'Failed to process CV', 
            error: error.message 
        });
    }
};

/**
 * Get Candidate's own CV Profile
 * GET /api/cv/profile
 */
const getMyCVProfile = (req, res) => {
    try {
        const profile = store.findOne('cv_profiles', p => p.candidateId === req.user._id);
        if (!profile) {
            return res.status(404).json({ message: 'No CV profile found. Please upload a CV first.' });
        }
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch CV profile', error: error.message });
    }
};

/**
 * Generate an Adaptive Test based on a candidate's CV profile
 * POST /api/cv/generate-test
 */
const generateAdaptiveTest = async (req, res) => {
    try {
        const { candidateId, selectedSkills, testConfig } = req.body;

        if (!candidateId || !selectedSkills || !selectedSkills.length) {
            return res.status(400).json({ message: 'candidateId and selectedSkills are required' });
        }

        const profileRecord = store.findOne('cv_profiles', p => p.candidateId === candidateId);
        if (!profileRecord) {
            return res.status(404).json({ message: 'Candidate CV profile not found' });
        }

        console.log(`🧠 Generating Adaptive Test for ${profileRecord.candidateName} on skills: ${selectedSkills.join(', ')}`);
        
        const prompt = getAdaptiveAssessmentPrompt(profileRecord.parsedData, selectedSkills, testConfig);
        const result = await callGeminiText(prompt, process.env.GEMINI_API_KEY);

        console.log(`✅ Adaptive Test Generated: "${result.data.assessmentTitle}" utilizing ${result.model}`);

        res.status(200).json({
            message: 'Adaptive test generated successfully',
            assessment: result.data,
            model: result.model
        });

    } catch (error) {
        console.error('❌ Adaptive Test Generation error:', error);
        res.status(500).json({ 
            message: 'Failed to generate adaptive test', 
            error: error.message 
        });
    }
};

/**
 * Get all candidate CV Profiles (Employer only)
 * GET /api/cv/profiles
 */
const getAllCVProfiles = (req, res) => {
    try {
        const profiles = store.find('cv_profiles');
        // Return lightweight version for selection list
        const summary = profiles.map(p => ({
            candidateId: p.candidateId,
            candidateName: p.candidateName,
            primaryRole: p.parsedData?.primaryRole,
            totalYearsExperience: p.parsedData?.totalYearsExperience,
            skills: p.parsedData?.skills?.map(s => s.skillName) || [],
            lastUpdated: p.lastUpdated
        }));
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch CV profiles', error: error.message });
    }
};

module.exports = {
    uploadCV,
    getMyCVProfile,
    generateAdaptiveTest,
    getAllCVProfiles
};
