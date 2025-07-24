const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
    {
        employeeName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        degination: { type: String, required: true },
        type: { type: String, required: true },
        joinedDate: { type: Date, required: true },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
        firebaseToken: [{ type: String }],
        notificationAllow: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
