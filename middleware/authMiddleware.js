const jwt = require('jsonwebtoken');
const SuperAdmin = require('../Models/superAdminModel');
const Admin = require('../Models/adminModel');
const Employee = require('../Models/employeeModel');

exports.authenticate = async (req, res, next) => {
    try {
        const token = (req.header("Authorization") && req.header("Authorization").replace("Bearer ", "")) || req.cookies.token || req.body.token;
        if (!token) return res.status(401).json({ success: false, message: "Token Missing or Invalid", });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const role = decoded.role;

        if (role === "SuperAdmin") {
            const user = await SuperAdmin.findById(decoded.id);
            if (!user) return res.status(404).json({ message: "User not found" });
            req.user = decoded;
            return next();
        }
        if (role === "Admin") {
            const user = await Admin.findById(decoded.id);
            if (!user) return res.status(404).json({ message: "User not found" });
            req.user = decoded;
            return next();
        }
        if (role === "Employee") {
            const user = await Employee.findById(decoded.id);
            if (!user) return res.status(404).json({ message: "User not found" });
            req.user = decoded;
            return next();
        }

        return res.status(404).json({ message: "User not found" });
    } catch (error) {
        return res.status(403).json({ message: "Invalid token" });
    }
};
