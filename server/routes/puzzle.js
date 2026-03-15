const express = require('express');
const router = express.Router();
const { startSession, getNextPuzzle, submitAnswer } = require('../controllers/puzzleController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, startSession);
router.get('/next', protect, getNextPuzzle);
router.post('/submit', protect, submitAnswer);

module.exports = router;
