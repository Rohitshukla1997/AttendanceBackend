const Admin = require("../Models/adminModel");
const Attendance = require("../Models/attendanceModel");
const Employee = require("../Models/employeeModel");


// GET /api/dashboard/superadmin
const getSuperAdminDashboard = async (req, res) => {
    try {
        if (req.user.role !== 'SuperAdmin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const totalAdmins = await Admin.countDocuments();
        const admins = await Admin.find();

        let totalEmployees = 0;
        let activeAdmins = 0;
        const adminStats = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newAdminsToday = await Admin.countDocuments({
            createdAt: { $gte: today }
        });

        for (const admin of admins) {
            const employeeCount = await Employee.countDocuments({ adminId: admin._id });

            const newEmployeesToday = await Employee.countDocuments({
                adminId: admin._id,
                createdAt: { $gte: today }
            });

            if (admin.status === 'Active') {
                activeAdmins += 1;
            }

            totalEmployees += employeeCount;

            adminStats.push({
                adminName: admin.adminName,
                status: admin.status || 'Inactive',
                employees: employeeCount,
                newEmployeesToday
            });
        }

        res.status(200).json({
            totalAdmins,
            totalEmployees,
            newAdminsToday,
            activeAdmins,
            adminStats
        });

    } catch (error) {
        console.error('SuperAdmin Dashboard Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// GET /api/dashboard/admin
const getAdminDashboard = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const adminId = req.user.id;
        const employees = await Employee.find({ adminId }).lean();
        const employeeIds = employees.map(e => e._id);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendances = await Attendance.find({
            date: today,
            employeeId: { $in: employeeIds }
        }).lean();

        const presentToday = attendances.filter(a => a.status === 'Present').length;
        const absentToday = employeeIds.length - presentToday;

        const newEmployeesToday = employees.filter(e => {
            const createdDate = new Date(e.createdAt);
            return createdDate.toDateString() === today.toDateString();
        }).length;

        const employeeSummary = employees.map(emp => {
            const todayAttendance = attendances.find(a => String(a.employeeId) === String(emp._id));
            return {
                employeeName: emp.employeeName,
                status: todayAttendance ? todayAttendance.status : 'Absent',
                joinedDate: emp.createdAt
            };
        });

        res.status(200).json({
            totalEmployees: employees.length,
            activeEmployeesToday: presentToday,
            absentEmployeesToday: absentToday,
            newEmployeesToday,
            summary: employeeSummary
        });
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// by id admin
const getAdminDashboardById = async (req, res) => {
    try {
        const { adminId } = req.params;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const employees = await Employee.find({ adminId }).lean();
        const employeeIds = employees.map(e => e._id);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendances = await Attendance.find({
            date: today,
            employeeId: { $in: employeeIds }
        }).lean();

        const presentToday = attendances.filter(a => a.status === 'Present').length;
        const absentToday = employeeIds.length - presentToday;

        const newEmployeesToday = employees.filter(e => {
            const createdDate = new Date(e.createdAt);
            return createdDate.toDateString() === today.toDateString();
        }).length;

        const employeeSummary = employees.map(emp => {
            const todayAttendance = attendances.find(a => String(a.employeeId) === String(emp._id));
            return {
                employeeName: emp.employeeName,
                status: todayAttendance ? todayAttendance.status : 'Absent',
                joinedDate: emp.createdAt
            };
        });

        res.status(200).json({
            adminId,
            adminName: admin.adminName,
            totalEmployees: employees.length,
            activeEmployeesToday: presentToday,
            absentEmployeesToday: absentToday,
            newEmployeesToday,
            summary: employeeSummary
        });
    } catch (error) {
        console.error('Dashboard by Admin ID Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = {
    getSuperAdminDashboard,
    getAdminDashboard,
    getAdminDashboardById
};