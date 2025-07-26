const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { createLeave, getLeaves, updateLeave, deleteLeave } = require('../Controllers/leaveController');
const router = express.Router();

router.use(express.json());

router.post('/create', authenticate, createLeave);
router.get('/all', authenticate, getLeaves);
router.patch('/update/:id', authenticate, updateLeave);
router.delete('/delete/:id', authenticate, deleteLeave);

module.exports = router;
