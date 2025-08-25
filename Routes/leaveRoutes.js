const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { createLeave, getLeaves, updateLeave, deleteLeave, approveORrejectLeave } = require('../Controllers/leaveController');
const router = express.Router();

router.use(express.json());

router.post('/create', authenticate, createLeave);
router.get('/get', authenticate, getLeaves);
router.patch('/update/:id', authenticate, updateLeave);
router.delete('/delete/:id', authenticate, deleteLeave);

// ✅ NEW: Admin approves or rejects a leave request
router.patch('/approve/:id', authenticate, approveORrejectLeave);

module.exports = router;
