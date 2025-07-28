const Admin = require("../Models/adminModel");
const Employee = require("../Models/employeeModel");
const SuperAdmin = require("../Models/superAdminModel");
const { comparePassword } = require("../Utils/crypto");
const jwt = require("jsonwebtoken");

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Please enter valid details" });
        }

        let user;

        // Try finding user in order: SuperAdmin → Admin → Employee
        user = await SuperAdmin.findOne({ username });
        if (!user) user = await Admin.findOne({ username });
        if (!user) user = await Employee.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password or email ID" });
        }

        //  Set admin status to Active on login
        if (user.role === "Admin") {
            await Admin.findByIdAndUpdate(user._id, { status: "Active" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } // optional: add expiry
        );

        // Send token in cookie and response
        return res
            .status(200)
            .cookie("token", token, {
                httpOnly: true,
                sameSite: "none",
                secure: true, // if using HTTPS
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            })
            .json({ message: "Successful Login", token });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};




// exports.loginUser = async (req, res) => {
//     try {
//         let user;
//         const { username, password } = req.body;
//         if (!username || !password) return res.status(400).json({ message: "Please enter valid details" });

//         if (!user) user = await SuperAdmin.findOne({ username }).lean();
//         if (!user) user = await Admin.findOne({ username });
//         if (!user) user = await Employee.findOne({ username });
//         if (!user) return res.status(400).json({ message: "Invalid credentials" });

//         console.log("AAAAAAAAAAAAAAAaa")

//         const isMatch = await comparePassword(password, user.password);
//         if (!isMatch) return res.status(400).json({ message: "Incorrect password or email ID" });

//         const token = jwt.sign({ id: user._id, username: user.username, role: user.role, }, process.env.JWT_SECRET);
//         return res.status(200).cookie('token', token, { httpOnly: true, sameSite: 'none' }).json({ message: "Successful Login", token });
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// };
