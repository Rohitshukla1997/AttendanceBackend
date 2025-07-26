const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { markAttendanceByAdmin, getMonthlyAttendance, editAttendanceByAdmin } = require('../Controllers/attendanceController');

// Mark attendance post
router.post('/mark/:employeeId', authenticate, markAttendanceByAdmin);

// edit attendance by admin
router.patch('/edit/:employeeId', authenticate, editAttendanceByAdmin);

// Get monthly attendance summary with auto absent
router.get('/monthly/:employeeId', authenticate, getMonthlyAttendance);

module.exports = router;
