const express = require('express');
const router = express.Router();
const { registerSuperadmin } = require('../Controllers/superAdminController');

router.post("/register", registerSuperadmin)

module.exports = router;