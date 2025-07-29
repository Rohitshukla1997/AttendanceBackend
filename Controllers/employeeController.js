const Employee = require("../Models/employeeModel");
const Attendance = require("../Models/attendanceModel");
const Leave = require("../Models/leaveModel");
const { encrypt } = require("../Utils/crypto");

// CREATE (Admin only)
exports.createEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { employeeName, email, phone, degination, type, joinedDate, username, password } = req.body;

        if (!employeeName || !email || !phone || !degination || !type || !joinedDate || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const employee = new Employee({
            employeeName,
            email,
            phone,
            degination,
            type,
            joinedDate: new Date(joinedDate),
            username,
            password: encrypt(password),
            adminId: req.user.id, // take from token
        });

        await employee.save();
        return res.status(201).json({ message: "Employee created successfully", employee });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// READ (Admin only) all empolyees
exports.getAllEmployees = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const employees = await Employee.find({ adminId: req.user.id }).select("-__v");

        if (!employees.length) {
            return res.status(404).json({ message: "No employees found" });
        }

        return res.status(200).json(employees);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// READ (Admin only) single employee
exports.getEmployeeProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const employee = await Employee.findOne({ _id: id, adminId })
            .select('employeeName email phone degination adminId') // include only required fields
            .lean();
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found or unauthorized' });
        }

        // Current month range
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-indexed
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        // Fetch attendance for current month
        const attendanceRecords = await Attendance.find({
            employeeId: employee._id,
            date: { $gte: startDate, $lte: endDate },
        });

        const attendanceMap = {};
        attendanceRecords.forEach(record => {
            const dateStr = record.date.toISOString().split('T')[0]; // yyyy-mm-dd
            attendanceMap[dateStr] = record.status;
        });

        // Fetch leave records overlapping this month
        const leaveRecords = await Leave.find({
            employeeId: employee._id,
            $or: [
                { fromDate: { $lte: endDate }, toDate: { $gte: startDate } },
            ],
        });

        const leaveDatesSet = new Set();
        leaveRecords.forEach(leave => {
            const from = new Date(leave.fromDate);
            const to = new Date(leave.toDate);
            for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
                const dateStr = new Date(d).toISOString().split('T')[0];
                leaveDatesSet.add(dateStr);
            }
        });

        // Loop through each day of current month
        const totalDays = new Date(year, month + 1, 0).getDate();
        const summary = {
            Present: 0,
            Absent: 0,
            Leave: 0,
        };

        for (let day = 1; day <= totalDays; day++) {
            const currentDate = new Date(year, month, day);
            const dateStr = currentDate.toISOString().split('T')[0];

            if (attendanceMap[dateStr] === 'Present') {
                summary.Present += 1;
            } else if (leaveDatesSet.has(dateStr)) {
                summary.Leave += 1;
            } else {
                summary.Absent += 1;
            }
        }

        res.status(200).json({
            ...employee,
            attendance: summary,
        });

    } catch (error) {
        console.error('Get Employee Profile Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// UPDATE (Admin only)
exports.updateEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { id } = req.params;
        const { employeeName, email, phone, degination, type, joinedDate } = req.body;

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        if (String(employee.adminId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Not allowed to update this employee" });
        }

        employee.employeeName = employeeName || employee.employeeName;
        employee.email = email || employee.email;
        employee.phone = phone || employee.phone;
        employee.degination = degination || employee.degination;
        employee.type = type || employee.type;
        employee.joinedDate = joinedDate || employee.joinedDate;
        employee.username = req.body.username || employee.username;
        employee.password = encrypt(req.body.password) || employee.password;

        await employee.save();

        return res.status(200).json({ message: "Employee updated successfully", employee });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// DELETE (Admin only)
exports.deleteEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) return res.status(404).json({ message: "Employee not found" });

        if (String(employee.adminId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Not allowed to delete this employee" });
        }

        await Employee.findByIdAndDelete(id);

        return res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
