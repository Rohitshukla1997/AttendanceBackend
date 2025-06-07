const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
    username: { type: String, required: [true, 'username is required'], unique: true },
    password: { type: String, required: [true, 'password is required'], unique: true },
    role: { type: String, default: "SuperAdmin" },
});

const SuperAdmin = mongoose.model("SuperAdmin", SuperAdminSchema);
module.exports = SuperAdmin