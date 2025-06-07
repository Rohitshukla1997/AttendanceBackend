const express = require("express");
const router = express.Router();
const loginRoute = require("./loginRoute");
const superadminRoute = require("./superAdminRoute");
const adminRoute = require("./adminRoute");

router.use("/user", loginRoute);
router.use("/superadmin", superadminRoute);
router.use("/admin", adminRoute);


module.exports = router