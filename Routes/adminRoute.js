const express = require('express');
const { createAdmin, getAllAdmins, updateAdmin, deleteAdmin } = require('../Controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/create', authenticate, createAdmin);
router.get('/get', authenticate, getAllAdmins);
router.patch('/update/:id', authenticate, updateAdmin);
router.delete('/delete/:id', authenticate, deleteAdmin);

module.exports = router;
