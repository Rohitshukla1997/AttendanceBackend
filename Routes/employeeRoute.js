const express = require('express');
const {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeProfileById,
} = require('../Controllers/employeeController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create', authenticate, createEmployee);
router.get('/get-all-employees', authenticate, getAllEmployees);
router.get('/profile/:id', authenticate, getEmployeeProfileById);
router.patch('/update/:id', authenticate, updateEmployee);
router.delete('/delete/:id', authenticate, deleteEmployee);

module.exports = router;
