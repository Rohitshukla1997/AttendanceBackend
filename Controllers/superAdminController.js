const MaintSuperAdmin = require("../Models/superAdminModel");
const { encrypt } = require("../Utils/crypto");

exports.registerSuperadmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUsername = await MaintSuperAdmin.findOne({ username });
        if (existingUsername) return res.status(400).json({ message: 'Username already exists' });

        const newUser = new MaintSuperAdmin({ username, email, password: encrypt(password) });
        await newUser.save();
        return res.status(201).json({ message: 'User registered successfully', user: newUser });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
