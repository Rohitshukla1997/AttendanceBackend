const express = require("express");
const router = express.Router();
const loginRoute = require("./loginRoute");
const superadminRoute = require("./superAdminRoute");
const adminRoute = require("./adminRoute");
const employeeRoute = require("./employeeRoute");

router.use("/user", loginRoute);
router.use("/superadmin", superadminRoute);
router.use("/admin", adminRoute);
router.use("/employee", employeeRoute);


module.exports = router