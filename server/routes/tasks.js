const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    createTask,
    generateAITask,
    getTasks,
    getTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

const router = express.Router();

// GET /api/tasks — List all tasks (filterable by ?skill=&employerId=&active=)
router.get('/', protect, getTasks);

// POST /api/tasks — Create a new task (employer only)
router.post('/', protect, authorize('employer'), createTask);

// POST /api/tasks/generate — Generate a task via AI (employer only)
router.post('/generate', protect, authorize('employer'), generateAITask);

// GET /api/tasks/:id — Get single task
router.get('/:id', protect, getTask);

// PUT /api/tasks/:id — Update a task (employer only)
router.put('/:id', protect, authorize('employer'), updateTask);

// DELETE /api/tasks/:id — Delete a task (employer only)
router.delete('/:id', protect, authorize('employer'), deleteTask);

module.exports = router;
