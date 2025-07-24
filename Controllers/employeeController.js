const Employee = require("../Models/employeeModel");

// CREATE (Admin only)
exports.createEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { employeeName, email, phone, degination, type, joinedDate } = req.body;

        if (!employeeName || !email || !phone || !degination || !type || !joinedDate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const employee = new Employee({
            employeeName,
            email,
            phone,
            degination,
            type,
            joinedDate,
            adminId: req.user.id, // take from token
        });

        await employee.save();
        return res.status(201).json({ message: "Employee created successfully", employee });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// READ (Admin only)
exports.getAllEmployees = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const employees = await Employee.find({ adminId: req.user.id }).select("-__v");

        if (!employees.length) {
            return res.status(404).json({ message: "No employees found" });
        }

        return res.status(200).json(employees);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// UPDATE (Admin only)
exports.updateEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { id } = req.params;
        const { employeeName, email, phone, degination, type, joinedDate } = req.body;

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        if (String(employee.adminId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Not allowed to update this employee" });
        }

        employee.employeeName = employeeName || employee.employeeName;
        employee.email = email || employee.email;
        employee.phone = phone || employee.phone;
        employee.degination = degination || employee.degination;
        employee.type = type || employee.type;
        employee.joinedDate = joinedDate || employee.joinedDate;

        await employee.save();

        return res.status(200).json({ message: "Employee updated successfully", employee });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// DELETE (Admin only)
exports.deleteEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { id } = req.params;
        const employee = await Employee.findById(id);

        if (!employee) return res.status(404).json({ message: "Employee not found" });

        if (String(employee.adminId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Not allowed to delete this employee" });
        }

        await Employee.findByIdAndDelete(id);

        return res.status(200).json({ message: "Employee deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
