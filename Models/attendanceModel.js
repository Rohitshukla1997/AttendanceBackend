const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        date: {
            type: Date,
            default: () => {
                const now = new Date();
                const istOffset = 5 * 60 * 60 * 1000; // IST is UTC+5:30
                return new Date(now.getTime() + istOffset);
            }
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Leave'],
            default: 'Present',
        },
    },
    { timestamps: true }
);

// Prevent duplicate marking
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
