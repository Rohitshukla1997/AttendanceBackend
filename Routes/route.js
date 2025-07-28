const express = require("express");
const router = express.Router();
const loginRoute = require("./loginRoute");
const superadminRoute = require("./superAdminRoute");
const adminRoute = require("./adminRoute");
const employeeRoute = require("./employeeRoute");
const attendanceRoute = require("./attendanceRoute")
const leaveRoute = require("./leaveRoutes")
const dashboardRoute = require("./dashboardRoute");

router.use("/user", loginRoute);
router.use("/superadmin", superadminRoute);
router.use("/admin", adminRoute);
router.use("/employee", employeeRoute);
router.use("/attendance", attendanceRoute);
router.use("/leave", leaveRoute);
router.use("/dashboard", dashboardRoute);



module.exports = router