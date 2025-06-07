const mongoose = require('mongoose');


const AdminSchema = new mongoose.Schema(
    {
        username: { type: String, required: [true, "username is required"], unique: true },
        password: { type: String, required: [true, "password is required"] },
        adminName: { type: String, },
        email: { type: String },
        phone: { type: String, },
        role: { type: String, default: "Admin" },
        firebaseToken: [{ type: String }],
        notificationAllow: { type: Boolean, default: false },

    },
    {
        timestamps: true
    }
);

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin