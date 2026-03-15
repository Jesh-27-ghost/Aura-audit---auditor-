const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const { uploadCV, getMyCVProfile, generateAdaptiveTest, getAllCVProfiles } = require('../controllers/cvController');

const router = express.Router();

// Multer config for CV processing (in-memory)
// We don't save the CVs to disk for security/privacy, just parse them in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            file.mimetype === 'text/plain') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOCX, and TXT files are allowed'), false);
        }
    }
});

// Candidate routes
router.post('/upload', protect, authorize('candidate'), upload.single('cvFile'), uploadCV);
router.get('/profile', protect, authorize('candidate'), getMyCVProfile);

// Employer routes
router.get('/profiles', protect, authorize('employer'), getAllCVProfiles);
router.post('/generate-test', protect, authorize('employer'), generateAdaptiveTest);

module.exports = router;
