const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/auth');
const {
    submitTaskTest,
    getSubmission,
    getTaskSubmissions,
    getMySubmissions
} = require('../controllers/taskController');

const router = express.Router();

// Configure multer for dual video uploads (screen + webcam)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.fieldname === 'screenVideo' ? 'screen' : 'webcam';
        const ext = path.extname(file.originalname) || '.webm';
        cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200MB max (two videos)
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/webm', 'video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'), false);
        }
    }
});
const uploadFields = upload.fields([
    { name: 'screenVideo', maxCount: 1 },
    { name: 'webcamVideo', maxCount: 1 }
]);

// GET /api/task-submissions/my — Get all submissions for logged in candidate
router.get('/my', protect, authorize('candidate'), getMySubmissions);

// POST /api/task-submissions/:taskId — Submit screen + webcam for a task
router.post('/:taskId', protect, authorize('candidate'), uploadFields, submitTaskTest);

// GET /api/task-submissions/:id — Get single submission
router.get('/:id', protect, getSubmission);

// GET /api/task-submissions/task/:taskId — All submissions for a task (employer view)
router.get('/task/:taskId', protect, getTaskSubmissions);

module.exports = router;
