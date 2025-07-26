// controllers/attendanceController.js

const Attendance = require("../Models/attendanceModel");
const Employee = require("../Models/employeeModel");
const Leave = require("../Models/leaveModel");


const markAttendanceByAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
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
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59); // end of month

        // ✅ Fetch Attendance
        const attendanceRecords = await Attendance.find({
            employeeId,
            date: { $gte: startDate, $lte: endDate },
        });

        const statusMap = {};
        attendanceRecords.forEach(record => {
            const dateStr = record.date.toLocaleDateString('en-CA'); // yyyy-mm-dd
            statusMap[dateStr] = record.status;
        });

        // ✅ Fetch Leave entries in the month
        const leaveRecords = await Leave.find({
            employeeId,
            $or: [
                { fromDate: { $lte: endDate }, toDate: { $gte: startDate } },
                { fromDate: { $gte: startDate, $lte: endDate } },
                { toDate: { $gte: startDate, $lte: endDate } },
            ],
        });

        const leaveDatesSet = new Set();
        leaveRecords.forEach(leave => {
            const from = new Date(leave.fromDate);
            const to = new Date(leave.toDate);
            for (
                let d = new Date(from);
                d <= to;
                d.setDate(d.getDate() + 1)
            ) {
                const dateStr = new Date(d).toLocaleDateString('en-CA');
                leaveDatesSet.add(dateStr);
            }
        });

        const summary = {
            Present: 0,
            Absent: 0,
            Leave: 0,
            TotalDays: 0,
        };

        const fullMonthData = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalDays = new Date(year, monthIndex + 1, 0).getDate();

        for (let day = 1; day <= totalDays; day++) {
            const current = new Date(year, monthIndex, day);
            if (current > today) break;

            const dateStr = current.toLocaleDateString('en-CA');

            let status = statusMap[dateStr];

            if (!status && leaveDatesSet.has(dateStr)) {
                status = 'Leave'; // ✅ mark leave only if not already Present
            }

            if (!status) {
                status = 'Absent';
            }

            summary[status] += 1;

            fullMonthData.push({
                date: dateStr,
                status,
            });
        }

        summary.TotalDays = fullMonthData.length;

        res.status(200).json({
            employeeId,
            employeeName: employee.employeeName,
            month,
            year,
            summary,
            records: fullMonthData,
        });
    } catch (error) {
        console.error('Monthly Attendance Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Make sure this is exported correctly
module.exports = {
    markAttendanceByAdmin,
    getMonthlyAttendance,
    editAttendanceByAdmin,
};
