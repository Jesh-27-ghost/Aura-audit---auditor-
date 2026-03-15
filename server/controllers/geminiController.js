const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
const path = require('path');
const { store } = require('../store');
const { getAssessmentPrompt } = require('../prompts/skillRubrics');
const { generateBadge } = require('./badgeController');

// Model priority list — try each in order until one works
const MODEL_PRIORITY = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',  // Added as fallback — often has separate quota
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Try to call Gemini with the uploaded file, trying multiple models
 * with retry + exponential backoff for quota errors
 */
async function callGeminiWithVideo(fileUri, fileMimeType, prompt, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError = null;
    const MAX_RETRIES = 3;

    for (const modelName of MODEL_PRIORITY) {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`🤖 Trying model: ${modelName} (attempt ${attempt}/${MAX_RETRIES})...`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const result = await model.generateContent([
                    {
                        fileData: {
                            mimeType: fileMimeType,
                            fileUri: fileUri
                        }
                    },
                    { text: prompt }
                ]);

                const response = await result.response;
                let responseText = response.text();

                console.log(`✅ ${modelName} responded successfully`);

                // Clean potential markdown code fences
                responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

                // Try to parse as JSON
                const parsed = JSON.parse(responseText);
                return { data: parsed, model: modelName };

            } catch (err) {
                lastError = err;
                const isQuota = err.message?.includes('429') ||
                    err.message?.includes('quota') ||
                    err.message?.includes('rate') ||
                    err.message?.includes('Resource has been exhausted') ||
                    err.status === 429;

                console.warn(`⚠️ ${modelName} attempt ${attempt} failed: ${err.message?.substring(0, 120)}`);

                if (isQuota && attempt < MAX_RETRIES) {
                    // Exponential backoff: 10s, 20s, 40s
                    const waitSec = 10 * Math.pow(2, attempt - 1);
                    console.log(`⏳ Quota/rate limit hit. Waiting ${waitSec}s before retry...`);
                    await sleep(waitSec * 1000);
                    continue; // retry same model
                }

                // If not a quota error, or we've exhausted retries, try next model
                if (isQuota) {
                    console.log(`⏭️ All retries exhausted for ${modelName}, trying next model...`);
                }
                break; // break retry loop, go to next model
            }
        }
    }

    // All models failed
    throw lastError || new Error('All Gemini models failed');
}

/**
 * Assess a candidate's skill via video analysis using Gemini Vision
 * POST /api/assess
 */
const assessSkill = async (req, res) => {
    try {
        const { skillName, industry, confidenceValue } = req.body;

        if (!skillName || !industry) {
            return res.status(400).json({ message: 'skillName and industry are required' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Video file is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'GEMINI_API_KEY is not configured on the server. Please add it to .env' });
        }

        const videoPath = req.file.path;
        const mimeType = req.file.mimetype || 'video/webm';
        const prompt = getAssessmentPrompt(skillName, industry, confidenceValue ? Number(confidenceValue) : 50);

        let assessmentData;
        let usedModel = 'none';
        let isGeminiAnalysis = false;

        try {
            // Use Google AI File Manager for uploading large video files
            const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

            const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(1);
            console.log(`\n${'='.repeat(60)}`);
            console.log(`📤 Uploading video (${fileSizeMB}MB, ${mimeType}) to Gemini...`);

            const uploadResult = await fileManager.uploadFile(videoPath, {
                mimeType: mimeType,
                displayName: `skill-assessment-${skillName}-${Date.now()}`
            });

            console.log(`✅ Upload complete. URI: ${uploadResult.file.uri}`);

            // Wait for file to be processed
            let file = uploadResult.file;
            let waitCount = 0;
            while (file.state === 'PROCESSING') {
                waitCount++;
                console.log(`⏳ Waiting for video processing... (${waitCount * 3}s)`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                file = await fileManager.getFile(file.name);

                // Timeout after 2 minutes
                if (waitCount > 40) {
                    throw new Error('Video processing timed out after 2 minutes');
                }
            }

            if (file.state === 'FAILED') {
                throw new Error('Video processing failed by Gemini');
            }

            console.log(`✅ Video processed. State: ${file.state}`);
            console.log('🧠 Sending to Gemini for skill assessment...');

            // Call Gemini with model fallback
            const geminiResult = await callGeminiWithVideo(
                file.uri,
                file.mimeType,
                prompt,
                process.env.GEMINI_API_KEY
            );

            assessmentData = geminiResult.data;
            usedModel = geminiResult.model;
            isGeminiAnalysis = true;

            console.log(`📊 Assessment received from ${usedModel}:`);
            console.log(`   Score: ${assessmentData.overallScore}, Level: ${assessmentData.skillLevel}, Passed: ${assessmentData.passed}`);

            // Log integrity flags if present
            if (assessmentData.integrityFlags) {
                const flags = assessmentData.integrityFlags;
                const flagged = flags.isDeepfakeDetected || flags.isCopyPasteDetected || flags.isProxyDetected;
                console.log(`   🔍 Integrity: ${flagged ? '🚨 FLAGGED' : '✅ CLEAN'}`);
                if (flags.isDeepfakeDetected) console.log(`      ⚠️ Deepfake: ${flags.deepfakeEvidence}`);
                if (flags.isCopyPasteDetected) console.log(`      ⚠️ Copy-Paste: ${flags.copyPasteEvidence}`);
                if (flags.isProxyDetected) console.log(`      ⚠️ Proxy: ${flags.proxyEvidence}`);
            }

            // Validate the response structure and enforce the Failure Trigger
            assessmentData = validateAndNormalizeAssessment(assessmentData, skillName);

        } catch (geminiError) {
            console.error(`\n❌ GEMINI API ERROR: ${geminiError.message}`);
            console.error('━'.repeat(60));
            console.error('The video could NOT be analyzed by AI.');
            console.error('Returning error to the user instead of fake scores.');
            console.error('━'.repeat(60));

            // Instead of returning fake scores, return an error
            return res.status(503).json({
                message: 'AI analysis failed. Please try again.',
                error: geminiError.message.includes('quota')
                    ? 'API quota exceeded. Please wait a few minutes and try again, or upgrade your Gemini API plan.'
                    : geminiError.message.includes('404')
                        ? 'AI model not available. Please contact support.'
                        : `Gemini error: ${geminiError.message.substring(0, 200)}`,
                retryable: true
            });
        }

        // Determine if integrity was flagged
        const integrityFlagged = assessmentData.integrityFlags && (
            assessmentData.integrityFlags.isDeepfakeDetected ||
            assessmentData.integrityFlags.isCopyPasteDetected ||
            assessmentData.integrityFlags.isProxyDetected
        );

        // Save assessment to store (now includes integrityFlags)
        const assessment = store.insert('assessments', {
            candidateId: req.user._id,
            skillName,
            industry,
            overallScore: assessmentData.overallScore,
            passed: assessmentData.passed,
            skillLevel: assessmentData.skillLevel,
            dimensions: assessmentData.dimensions,
            strengths: assessmentData.strengths || [],
            improvements: assessmentData.improvements || [],
            flaws: assessmentData.flaws || [],
            timestamps: assessmentData.timestamps || [],
            employerSummary: assessmentData.employerSummary || '',
            verifiedSkills: assessmentData.verifiedSkills || [],
            videoPath: videoPath,
            analyzedBy: usedModel,
            isGeminiAnalysis: isGeminiAnalysis,
            // NEW: Store forensic integrity analysis results
            integrityFlags: assessmentData.integrityFlags || null,
            integrityFlagged: !!integrityFlagged
        });

        let badge = null;
        // Auto-generate badge ONLY if passed AND no integrity violations
        if (assessmentData.passed && assessmentData.overallScore >= 70 && !integrityFlagged) {
            badge = generateBadge(assessment._id, req.user);
            store.updateById('assessments', assessment._id, { badgeId: badge.badgeId });
        }

        console.log(`✅ Assessment saved. ID: ${assessment._id}, Badge: ${badge ? badge.badgeId : 'none'}, Integrity: ${integrityFlagged ? '🚨 FLAGGED' : '✅ CLEAN'}`);
        console.log('='.repeat(60) + '\n');

        res.status(201).json({
            message: 'Assessment complete',
            assessment: { ...assessment, badgeId: badge ? badge.badgeId : null },
            badgeId: badge ? badge.badgeId : null
        });

    } catch (error) {
        console.error('❌ Assessment error:', error);
        res.status(500).json({ message: 'Assessment failed', error: error.message });
    }
};

/**
 * Validate and normalize the Gemini response
 * 
 * IMPORTANT: This function enforces the FAILURE TRIGGER.
 * If any integrity flag is detected, `passed` is forced to false
 * regardless of the score. This is the last line of defense.
 */
function validateAndNormalizeAssessment(data, skillName) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 1. Normalize integrityFlags
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!data.integrityFlags || typeof data.integrityFlags !== 'object') {
        data.integrityFlags = {
            isDeepfakeDetected: false,
            deepfakeConfidence: 'none',
            deepfakeEvidence: '',
            isCopyPasteDetected: false,
            copyPasteEvidence: '',
            isProxyDetected: false,
            proxyEvidence: ''
        };
    }
    // Coerce flag fields to booleans
    data.integrityFlags.isDeepfakeDetected = !!data.integrityFlags.isDeepfakeDetected;
    data.integrityFlags.isCopyPasteDetected = !!data.integrityFlags.isCopyPasteDetected;
    data.integrityFlags.isProxyDetected = !!data.integrityFlags.isProxyDetected;

    const integrityCompromised =
        data.integrityFlags.isDeepfakeDetected ||
        data.integrityFlags.isCopyPasteDetected ||
        data.integrityFlags.isProxyDetected;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 2. Normalize overallScore
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 100) {
        data.overallScore = Math.max(0, Math.min(100, Number(data.overallScore) || 0));
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 3. FAILURE TRIGGER — enforce hard pass/fail logic
    //    Integrity violation → ALWAYS fail, no exceptions
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (integrityCompromised) {
        data.passed = false;
        // Cap the score — a cheater should not display a high score
        data.overallScore = Math.min(data.overallScore, 30);
    } else {
        data.passed = data.overallScore >= 70;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 4. Normalize skillLevel based on final score
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!data.skillLevel || !['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(data.skillLevel)) {
        if (data.overallScore >= 90) data.skillLevel = 'Expert';
        else if (data.overallScore >= 80) data.skillLevel = 'Advanced';
        else if (data.overallScore >= 60) data.skillLevel = 'Intermediate';
        else data.skillLevel = 'Beginner';
    }

    // If integrity is compromised, force skill level to Beginner
    if (integrityCompromised) {
        data.skillLevel = 'Beginner';
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 5. Normalize dimensions
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!data.dimensions || typeof data.dimensions !== 'object') {
        data.dimensions = {};
    }

    const requiredDimensions = ['technicalAccuracy', 'efficiency', 'bestPractices', 'problemSolving'];
    for (const dim of requiredDimensions) {
        if (!data.dimensions[dim]) {
            data.dimensions[dim] = { score: data.overallScore, observation: 'Analysis not available for this dimension.' };
        }
        if (typeof data.dimensions[dim].score === 'number') {
            data.dimensions[dim].score = Math.max(0, Math.min(100, data.dimensions[dim].score));
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 6. Normalize arrays and strings
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!Array.isArray(data.strengths)) data.strengths = [];
    if (!Array.isArray(data.improvements)) data.improvements = [];
    if (!Array.isArray(data.verifiedSkills)) data.verifiedSkills = [];
    if (!Array.isArray(data.flaws)) data.flaws = [];
    if (!Array.isArray(data.timestamps)) data.timestamps = [];

    // If integrity compromised, clear verified skills — cheaters get nothing
    if (integrityCompromised) {
        data.verifiedSkills = [];
    }

    // Ensure employerSummary
    if (!data.employerSummary || typeof data.employerSummary !== 'string') {
        data.employerSummary = `Candidate demonstrated ${data.skillLevel.toLowerCase()}-level proficiency in ${skillName} with a score of ${data.overallScore}/100.`;
    }

    // Append integrity warning to employer summary if flagged
    if (integrityCompromised) {
        const violations = [];
        if (data.integrityFlags.isDeepfakeDetected) violations.push('potential deepfake');
        if (data.integrityFlags.isCopyPasteDetected) violations.push('copy-paste detected');
        if (data.integrityFlags.isProxyDetected) violations.push('proxy/identity fraud');
        data.employerSummary += ` ⚠️ INTEGRITY ALERT: This submission was flagged for ${violations.join(', ')}. Manual review recommended.`;
    }

    return data;
}

module.exports = { assessSkill };
