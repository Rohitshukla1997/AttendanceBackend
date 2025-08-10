// controllers/attendanceController.js

const Attendance = require("../Models/attendanceModel");
const Employee = require("../Models/employeeModel");
const Leave = require("../Models/leaveModel");


const markAttendanceByAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Employee') {
            return res.status(403).json({ message: 'Only Admin can mark attendance' });
        }

        const { employeeId } = req.params;
        const adminId = req.user.id;

        const employee = await Employee.findOne({ _id: employeeId, adminId });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found or unauthorized' });
        }

        //Correct UTC midnight
        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        const existing = await Attendance.findOne({ employeeId, date: todayUTC });
        if (existing) {
            return res.status(400).json({ message: 'Attendance already marked for today' });
        }

        const attendance = await Attendance.create({
            employeeId,
            date: todayUTC,
            status: 'Present',
        });

        res.status(200).json({
            message: 'Attendance marked successfully',
            data: attendance,
        });
    } catch (err) {
        console.error('Attendance Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// edit
const editAttendanceByAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only Admin can edit attendance' });
        }

        const { employeeId } = req.params;
        const { date, status } = req.body;

        if (!date || !['Present', 'Absent'].includes(status)) {
            return res.status(400).json({ message: 'Valid date and status (Present/Absent) required' });
        }

        const adminId = req.user.id;
        const employee = await Employee.findOne({ _id: employeeId, adminId });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found or unauthorized' });
        }

        const customDate = new Date(date);
        customDate.setHours(0, 0, 0, 0); // Normalize to 00:00

        const updated = await Attendance.findOneAndUpdate(
            { employeeId, date: customDate },
            { $set: { status, employeeId, date: customDate } },
            { new: true, upsert: true } // upsert will insert if not found
        );


        if (!updated) {
            return res.status(404).json({ message: 'Attendance record not found for the given date' });
        }

        res.status(200).json({
            message: 'Attendance updated successfully',
            data: updated,
        });
    } catch (error) {
        console.error('Edit Attendance Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// all get montly attendance
const getMonthlyAttendance = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const monthIndex = Number(month) - 1;
        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

        // Fetch attendance records
        const attendanceRecords = await Attendance.find({
            employeeId,
            date: { $gte: startDate, $lte: endDate },
        });

        const attendanceMap = {};
        attendanceRecords.forEach(record => {
            const dateStr = record.date.toISOString().split("T")[0];
            attendanceMap[dateStr] = record.status;
        });

        //  Fetch leave records (Pending/Approved only)
        const leaveRecords = await Leave.find({
            employeeId,
            fromDate: { $lte: endDate },
            toDate: { $gte: startDate },
            status: { $in: ["Pending", "Approved"] },
        });

        const leaveMap = new Map(); // dateStr => "Pending" | "Approved"
        leaveRecords.forEach(leave => {
            const from = new Date(leave.fromDate);
            const to = new Date(leave.toDate);
            for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split("T")[0];
                const time = d.getTime();
                if (time >= startDate.getTime() && time <= endDate.getTime()) {
                    leaveMap.set(dateStr, leave.status);
                }
            }
        });

        const summary = {
            Present: 0,
            Absent: 0,
            Approved: 0,
            Pending: 0,
            Holiday: 0,
        };

        const records = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalDays = new Date(year, monthIndex + 1, 0).getDate();

        for (let day = 1; day <= totalDays; day++) {
            const currentDate = new Date(year, monthIndex, day);
            if (currentDate > today) break;

            const dateStr = currentDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });


            //  Mark Sundays as "Holiday"
            if (currentDate.getDay() === 0) {
                records.push({ date: dateStr, status: "Holiday" });
                summary.Holiday += 1;
                continue;
            }

            let status = "";

            if (attendanceMap[dateStr] === "Present") {
                status = "Present";
                summary.Present += 1;
            } else if (leaveMap.has(dateStr)) {
                status = leaveMap.get(dateStr); // "Approved" or "Pending"
                summary[status] += 1;
            } else {
                status = "Absent";
                summary.Absent += 1;
            }

            records.push({ date: dateStr, status });
        }

        res.status(200).json({
            employeeId,
            employeeName: employee.employeeName,
            month,
            year,
            attendance: summary,
            records,
        });
    } catch (error) {
        console.error("Monthly Attendance Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Remaining Today's Attendance (Employees whose today's attendance is not marked)
const getRemainingTodayAttendance = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only Admin can view remaining attendance' });
        }

        const adminId = req.user.id;

        // Get today's UTC date at midnight
        const now = new Date();
        const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

        // Find all employees under this admin
        const employees = await Employee.find({ adminId });

        if (!employees.length) {
            return res.status(404).json({ message: 'No employees found for this admin' });
        }

        const employeeIds = employees.map(emp => emp._id);

        // Find employees who already have attendance for today
        const attendedToday = await Attendance.find({
            employeeId: { $in: employeeIds },
            date: todayUTC
        }).select('employeeId');

        const attendedIds = attendedToday.map(a => a.employeeId.toString());

        // Filter out employees who are not marked yet
        const remainingEmployees = employees.filter(emp => !attendedIds.includes(emp._id.toString()));

        res.status(200).json({
            message: 'Remaining employees for today’s attendance',
            count: remainingEmployees.length,
            data: remainingEmployees
        });
    } catch (error) {
        console.error('Remaining Attendance Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Make sure this is exported correctly
module.exports = {
    markAttendanceByAdmin,
    getMonthlyAttendance,
    editAttendanceByAdmin,
    getRemainingTodayAttendance,
};
