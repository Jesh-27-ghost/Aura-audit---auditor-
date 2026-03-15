const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
const path = require('path');
const { store } = require('../store');
const { getAssessmentPrompt } = require('../prompts/skillRubrics');
const { getSuspicionPrompt } = require('../prompts/suspicionPrompt');
const { getTaskGenerationPrompt } = require('../prompts/taskGeneration');

// Model priority list — use valid, available model names
const MODEL_PRIORITY = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Call Gemini with a video file, trying multiple models with retry
 */
async function callGeminiWithVideo(fileUri, fileMimeType, prompt, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError = null;
    const MAX_RETRIES = 3;

    for (const modelName of MODEL_PRIORITY) {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`🤖 [Task] Trying model: ${modelName} (attempt ${attempt}/${MAX_RETRIES})...`);
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
                console.log(`✅ [Task] ${modelName} responded successfully`);

                responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const parsed = JSON.parse(responseText);
                return { data: parsed, model: modelName };
            } catch (err) {
                lastError = err;
                console.warn(`⚠️ [Task] ${modelName} attempt ${attempt} failed: ${err.message?.substring(0, 150)}`);

                const isNotFound = err.status === 404 || err.message?.includes('404') || err.message?.includes('not found');
                if (isNotFound) {
                    console.warn(`⚠️ [Task] Model ${modelName} not available, skipping to next...`);
                    break;
                }

                const isQuota = err.message?.includes('429') ||
                    err.message?.includes('quota') ||
                    err.message?.includes('rate') ||
                    err.message?.includes('Resource has been exhausted') ||
                    err.status === 429;

                const isOverloaded = err.status === 503 || err.message?.includes('503') || err.message?.includes('overloaded');

                if ((isQuota || isOverloaded) && attempt < MAX_RETRIES) {
                    const waitSec = 10 * Math.pow(2, attempt - 1);
                    console.log(`⏳ [Task] Waiting ${waitSec}s before retry...`);
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
 * Call Gemini with a text prompt only (no file)
 */
async function callGeminiText(prompt, apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError = null;
    const MAX_RETRIES = 4;

    for (const modelName of MODEL_PRIORITY) {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                console.log(`🤖 [TaskAI] Trying model: ${modelName} (attempt ${attempt}/${MAX_RETRIES})...`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const result = await model.generateContent(prompt);
                const response = await result.response;
                let responseText = response.text();
                console.log(`✅ [TaskAI] ${modelName} responded successfully`);

                responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const parsed = JSON.parse(responseText);
                return { data: parsed, model: modelName };
            } catch (err) {
                lastError = err;
                console.warn(`⚠️ [TaskAI] ${modelName} attempt ${attempt} failed: ${err.message?.substring(0, 150)}`);

                const isNotFound = err.status === 404 || err.message?.includes('404') || err.message?.includes('not found');
                if (isNotFound) {
                    console.warn(`⚠️ [TaskAI] Model ${modelName} not available, skipping to next...`);
                    break;
                }

                const isQuota = err.message?.includes('429') ||
                    err.message?.includes('quota') ||
                    err.message?.includes('rate') ||
                    err.message?.includes('Resource has been exhausted') ||
                    err.status === 429;

                const isOverloaded = err.status === 503 || err.message?.includes('503') || err.message?.includes('overloaded');

                if ((isQuota || isOverloaded) && attempt < MAX_RETRIES) {
                    const waitSec = 15 * attempt;
                    console.log(`⏳ [TaskAI] Rate limited. Waiting ${waitSec}s before retry...`);
                    await sleep(waitSec * 1000);
                    continue;
                }
                break;
            }
        }
    }
    throw lastError || new Error('All Gemini models failed to generate task');
}

/**
 * Upload a video file to Gemini and wait for processing
 */
async function uploadAndProcessVideo(filePath, mimeType, displayName) {
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const fileSizeMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(1);
    console.log(`📤 [Task] Uploading video (${fileSizeMB}MB, ${mimeType}) — ${displayName}`);

    const uploadResult = await fileManager.uploadFile(filePath, {
        mimeType,
        displayName
    });

    let file = uploadResult.file;
    let waitCount = 0;
    while (file.state === 'PROCESSING') {
        waitCount++;
        console.log(`⏳ [Task] Processing... (${waitCount * 3}s)`);
        await sleep(3000);
        file = await fileManager.getFile(file.name);
        if (waitCount > 40) throw new Error('Video processing timed out');
    }

    if (file.state === 'FAILED') throw new Error('Video processing failed');
    console.log(`✅ [Task] Video processed: ${file.uri}`);
    return file;
}

// ═══════════════════════════════════════════
// TASK CRUD OPERATIONS
// ═══════════════════════════════════════════

/**
 * Create a new task (employer only)
 * POST /api/tasks
 */
const createTask = (req, res) => {
    try {
        const { skillName, title, description, questions, timeLimitMinutes } = req.body;

        if (!skillName || !title || !timeLimitMinutes) {
            return res.status(400).json({ message: 'skillName, title, and timeLimitMinutes are required' });
        }

        const task = store.insert('tasks', {
            employerId: req.user._id,
            employerName: req.user.name,
            skillName,
            title,
            description: description || '',
            questions: questions || [],
            timeLimitMinutes: parseInt(timeLimitMinutes),
            isActive: true,
            submissionCount: 0
        });

        console.log(`📋 Task created: "${title}" by ${req.user.name} (${skillName}, ${timeLimitMinutes}min)`);
        res.status(201).json({ message: 'Task created', task });
    } catch (error) {
        console.error('Task creation error:', error);
        res.status(500).json({ message: 'Failed to create task', error: error.message });
    }
};

/**
 * Generate a task using AI
 * POST /api/tasks/generate
 */
const generateAITask = async (req, res) => {
    try {
        const { skillName, timeLimitMinutes } = req.body;

        if (!skillName || !timeLimitMinutes) {
            return res.status(400).json({ message: 'skillName and timeLimitMinutes are required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'GEMINI_API_KEY not configured' });
        }

        console.log(`🧠 Generating AI task for ${skillName} (${timeLimitMinutes} min)...`);
        const prompt = getTaskGenerationPrompt(skillName, timeLimitMinutes);
        
        const result = await callGeminiText(prompt, process.env.GEMINI_API_KEY);
        
        console.log(`✅ AI generated task: "${result.data.title}" using ${result.model}`);
        res.json({ 
            message: 'Task generated',
            task: result.data,
            model: result.model
        });
    } catch (error) {
        console.error('Task generation error:', error);
        res.status(500).json({ message: 'Failed to generate task via AI', error: error.message });
    }
};

/**
 * Get all tasks (filterable)
 * GET /api/tasks
 */
const getTasks = (req, res) => {
    try {
        const { skill, employerId, active } = req.query;
        let tasks = store.find('tasks', () => true);

        if (skill) tasks = tasks.filter(t => t.skillName === skill);
        if (employerId) tasks = tasks.filter(t => t.employerId === employerId);
        if (active !== undefined) tasks = tasks.filter(t => t.isActive === (active === 'true'));

        // Add submission count for each task
        tasks = tasks.map(t => {
            const submissions = store.find('task_submissions', s => s.taskId === t._id);
            return { ...t, submissionCount: submissions.length };
        });

        tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
    }
};

/**
 * Get a single task
 * GET /api/tasks/:id
 */
const getTask = (req, res) => {
    try {
        const task = store.findById('tasks', req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch task', error: error.message });
    }
};

/**
 * Update a task (employer only, must own it)
 * PUT /api/tasks/:id
 */
const updateTask = (req, res) => {
    try {
        const task = store.findById('tasks', req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.employerId !== req.user._id) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        const { title, description, questions, timeLimitMinutes, isActive } = req.body;
        const updates = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (questions !== undefined) updates.questions = questions;
        if (timeLimitMinutes !== undefined) updates.timeLimitMinutes = parseInt(timeLimitMinutes);
        if (isActive !== undefined) updates.isActive = isActive;

        const updated = store.updateById('tasks', req.params.id, updates);
        res.json({ message: 'Task updated', task: updated });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update task', error: error.message });
    }
};

/**
 * Delete a task (employer only, must own it)
 * DELETE /api/tasks/:id
 */
const deleteTask = (req, res) => {
    try {
        const task = store.findById('tasks', req.params.id);
        if (!task) return res.status(404).json({ message: 'Task not found' });
        if (task.employerId !== req.user._id) {
            return res.status(403).json({ message: 'Not authorized to delete this task' });
        }

        // Soft delete — mark as inactive
        store.updateById('tasks', req.params.id, { isActive: false });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete task', error: error.message });
    }
};

// ═══════════════════════════════════════════
// TASK SUBMISSION & AI EVALUATION
// ═══════════════════════════════════════════

/**
 * Submit a task attempt with screen + webcam recordings
 * POST /api/task-submissions/:taskId
 */
const submitTaskTest = async (req, res) => {
    try {
        const task = store.findById('tasks', req.params.taskId);
        if (!task) return res.status(404).json({ message: 'Task not found' });

        if (!req.files || !req.files.screenVideo) {
            return res.status(400).json({ message: 'Screen recording is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: 'GEMINI_API_KEY is not configured' });
        }

        const screenVideoPath = req.files.screenVideo[0].path;
        const screenMimeType = req.files.screenVideo[0].mimetype || 'video/webm';
        const webcamVideoPath = req.files.webcamVideo ? req.files.webcamVideo[0].path : null;
        const webcamMimeType = req.files.webcamVideo ? (req.files.webcamVideo[0].mimetype || 'video/webm') : null;

        let skillReport = null;
        let suspicionReport = null;
        let usedModel = 'none';

        console.log(`\n${'='.repeat(60)}`);
        console.log(`📝 Task Submission: "${task.title}" by ${req.user.name}`);
        console.log(`   Skill: ${task.skillName} | Time Limit: ${task.timeLimitMinutes}min`);

        // Extract confidence value from form data
        const confidenceValue = parseInt(req.body.confidenceValue) || 50;
        console.log(`   Confidence Level: ${confidenceValue}/100`);

        // ── PASS 1: Skill Assessment from Screen Recording ──
        try {
            const screenFile = await uploadAndProcessVideo(
                screenVideoPath,
                screenMimeType,
                `task-screen-${task.skillName}-${Date.now()}`
            );

            const skillPrompt = getAssessmentPrompt(task.skillName, 'IT / Software', confidenceValue);
            const skillResult = await callGeminiWithVideo(
                screenFile.uri,
                screenFile.mimeType,
                skillPrompt,
                process.env.GEMINI_API_KEY
            );

            skillReport = skillResult.data;
            usedModel = skillResult.model;
            console.log(`📊 Skill Report: Score ${skillReport.overallScore}, Level: ${skillReport.skillLevel}`);
        } catch (err) {
            console.error(`❌ Skill analysis failed: ${err.message}`);
            return res.status(503).json({
                message: 'AI skill analysis failed. Please try again.',
                error: err.message.includes('quota')
                    ? 'API quota exceeded. Please wait and try again.'
                    : `Gemini error: ${err.message.substring(0, 200)}`,
                retryable: true
            });
        }

        // ── PASS 2: Suspicion Analysis from Webcam (if provided) ──
        if (webcamVideoPath) {
            try {
                const webcamFile = await uploadAndProcessVideo(
                    webcamVideoPath,
                    webcamMimeType,
                    `task-webcam-${task.skillName}-${Date.now()}`
                );

                const suspicionPrompt = getSuspicionPrompt(task.skillName, task.timeLimitMinutes);
                const suspicionResult = await callGeminiWithVideo(
                    webcamFile.uri,
                    webcamFile.mimeType,
                    suspicionPrompt,
                    process.env.GEMINI_API_KEY
                );

                suspicionReport = suspicionResult.data;
                suspicionReport = validateSuspicionReport(suspicionReport);
                console.log(`🔍 Suspicion Score: ${suspicionReport.suspicionScore}/100 (${suspicionReport.confidenceLevel})`);
            } catch (err) {
                console.warn(`⚠️ Webcam analysis failed (non-fatal): ${err.message}`);
                suspicionReport = getDefaultSuspicionReport('Webcam analysis unavailable');
            }
        } else {
            suspicionReport = getDefaultSuspicionReport('No webcam video provided');
        }

        // ── Normalize skill report ──
        if (typeof skillReport.overallScore !== 'number') {
            skillReport.overallScore = Math.max(0, Math.min(100, Number(skillReport.overallScore) || 0));
        }
        skillReport.passed = skillReport.overallScore >= 70;
        if (!skillReport.skillLevel) {
            if (skillReport.overallScore >= 90) skillReport.skillLevel = 'Expert';
            else if (skillReport.overallScore >= 80) skillReport.skillLevel = 'Advanced';
            else if (skillReport.overallScore >= 60) skillReport.skillLevel = 'Intermediate';
            else skillReport.skillLevel = 'Beginner';
        }

        // ── Save submission ──
        const submission = store.insert('task_submissions', {
            taskId: task._id,
            candidateId: req.user._id,
            candidateName: req.user.name,
            candidateEmail: req.user.email,
            skillName: task.skillName,
            taskTitle: task.title,
            // Skill report
            overallScore: skillReport.overallScore,
            passed: skillReport.passed,
            skillLevel: skillReport.skillLevel,
            dimensions: skillReport.dimensions || {},
            strengths: skillReport.strengths || [],
            improvements: skillReport.improvements || [],
            flaws: skillReport.flaws || [],
            employerSummary: skillReport.employerSummary || '',
            verifiedSkills: skillReport.verifiedSkills || [],
            // Suspicion report
            suspicionScore: suspicionReport.suspicionScore,
            suspicionReasons: suspicionReport.suspicionReasons || [],
            suspicionConfidence: suspicionReport.confidenceLevel,
            behavioralSummary: suspicionReport.behavioralSummary,
            suspicionDetails: suspicionReport,
            // Metadata
            screenVideoPath,
            webcamVideoPath: webcamVideoPath || '',
            analyzedBy: usedModel,
            timeLimitMinutes: task.timeLimitMinutes,
            confidenceValue
        });

        console.log(`✅ Submission saved: ${submission._id}`);
        console.log(`   Score: ${skillReport.overallScore} | Suspicion: ${suspicionReport.suspicionScore}`);
        console.log('='.repeat(60) + '\n');

        res.status(201).json({
            message: 'Submission evaluated',
            submission
        });

    } catch (error) {
        console.error('❌ Task submission error:', error);
        res.status(500).json({ message: 'Submission failed', error: error.message });
    }
};

/**
 * Get a single submission
 * GET /api/task-submissions/:id
 */
const getSubmission = (req, res) => {
    try {
        const submission = store.findById('task_submissions', req.params.id);
        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch submission', error: error.message });
    }
};

/**
 * Get all submissions for a task (employer view)
 * GET /api/task-submissions/task/:taskId
 */
const getTaskSubmissions = (req, res) => {
    try {
        const submissions = store.find('task_submissions', s => s.taskId === req.params.taskId);
        submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
    }
};

// ═══════════════════════════════════════════

/**
 * Get all submissions for a candidate (candidate view)
 * GET /api/task-submissions/my
 */
const getMySubmissions = (req, res) => {
    try {
        const submissions = store.find('task_submissions', s => s.candidateId === req.user._id);
        submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch your submissions', error: error.message });
    }
};

// ═══════════════════════════════════════════

function validateSuspicionReport(data) {
    if (typeof data.suspicionScore !== 'number') {
        data.suspicionScore = Math.max(0, Math.min(100, Number(data.suspicionScore) || 0));
    }
    if (!['low', 'medium', 'high'].includes(data.confidenceLevel)) {
        data.confidenceLevel = 'low';
    }
    if (!data.behavioralSummary) {
        data.behavioralSummary = 'Behavioral analysis completed.';
    }
    if (!Array.isArray(data.flaggedMoments)) {
        data.flaggedMoments = [];
    }
    return data;
}

function getDefaultSuspicionReport(reason) {
    return {
        suspicionScore: 0,
        confidenceLevel: 'low',
        behavioralSummary: reason,
        eyeMovement: { score: 0, observation: 'Not available' },
        presenceConsistency: { score: 0, observation: 'Not available' },
        communicationFlags: { detected: false, observation: 'Not available' },
        distractionLevel: { score: 0, observation: 'Not available' },
        environmentalConcerns: { detected: false, observation: 'Not available' },
        flaggedMoments: []
    };
}

module.exports = {
    createTask,
    generateAITask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    submitTaskTest,
    getSubmission,
    getTaskSubmissions,
    getMySubmissions
};
