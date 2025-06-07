const Admin = require("../Models/adminModel");
const { encrypt, decrypt } = require("../Utils/crypto");
const { findSameUsername } = require("../Utils/usernameUniqueCheck");

exports.createAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'SuperAdmin') return res.status(403).json({ message: 'Access denied' });
        const { adminName, email, phone, Address, username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

        // Check if user already exists
        const existingUserByUsername = await findSameUsername(username);
        if (existingUserByUsername.exists) return res.status(400).json({ message: "This user already exists" });

        const admin = new Admin({
            adminName,
            email,
            phone,
            Address,
            username,
            password: encrypt(password),
        });
        await admin.save();
        return res.status(201).json(admin);
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.username) return res.status(400).json({ message: "Username already exists" });
        return res.status(400).json({ message: error.message });
    }
};

exports.getAllAdmins = async (req, res) => {
    try {
        if (req.user.role !== 'SuperAdmin') return res.status(403).json({ message: 'Access denied' });
        const admins = (await Admin.find().select('-__v -createdAt -updatedAt')).map(admin => {
            admin.password = decrypt(admin.password)
            return admin;
        }
        );
        return res.status(200).json(admins);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminName, email, phone, Address, username, password } = req.body;
        if (req.user.role !== 'SuperAdmin') return res.status(403).json({ message: 'Access denied' });

        const existingAdmin = await Admin.findById(id);
        if (!existingAdmin) return res.status(404).json({ message: "Admin not found" });

        // If username is changed, check if it's unique
        if (username && username !== existingAdmin.username) {
            const checkUsername = await findSameUsername(username);
            if (checkUsername.exists) return res.status(400).json({ message: "Username already exists" });
            existingAdmin.username = username;
        }

        if (adminName) existingAdmin.adminName = adminName;
        if (email) existingAdmin.email = email;
        if (phone) existingAdmin.phone = phone;
        if (Address) existingAdmin.Address = Address;
        if (password) existingAdmin.password = encrypt(password);

        await existingAdmin.save();
        return res.status(200).json({ message: "Admin updated successfully" });
    } catch (error) {
        console.error("Update Admin Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'SuperAdmin') return res.status(403).json({ message: 'Access denied' });
        if (!req.params.id) return res.status(400).json({ message: 'Admin ID is required' });
        const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
        if (!deletedAdmin) return res.status(404).json({ message: 'Admin not found' });
        return res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
