const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getSuperAdminDashboard, getAdminDashboard, getAdminDashboardById } = require('../Controllers/dashboardController');

router.get('/superadmin', authenticate, getSuperAdminDashboard);
router.get('/admin', authenticate, getAdminDashboard);
router.get('/admin/:adminId', authenticate, getAdminDashboardById);


module.exports = router;
