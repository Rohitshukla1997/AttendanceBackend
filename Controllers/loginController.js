const Admin = require("../Models/adminModel");
const SuperAdmin = require("../Models/superAdminModel");
const { comparePassword } = require("../Utils/crypto");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
    try {
        let user;
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Please enter valid details" });

        if (!user) user = await SuperAdmin.findOne({ username }).lean();
        if (!user) user = await Admin.findOne({ username });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password or email ID" });

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role, }, process.env.JWT_SECRET);
        return res.status(200).cookie('token', token, { httpOnly: true, sameSite: 'none' }).json({ message: "Successful Login", token });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};