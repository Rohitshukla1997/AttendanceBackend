const Leave = require('../Models/leaveModel');
const Employee = require('../Models/employeeModel');

// Create Leave
const createLeave = async (req, res) => {
    try {
        const { employeeId, fromDate, toDate, description } = req.body;

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const leave = await Leave.create({
            employeeId,
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
            description,
        });

        res.status(201).json({ message: 'Leave created', data: leave });
    } catch (err) {
        console.error('Create Leave Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Leaves for Admin (with optional employeeId filter)
const getLeaves = async (req, res) => {
    try {
        const { employeeId } = req.query;

        const filter = employeeId ? { employeeId } : {};
        const leaves = await Leave.find(filter).populate('employeeId', 'employeeName');

        res.status(200).json({ data: leaves });
    } catch (err) {
        console.error('Get Leaves Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// patch Update Leave
const updateLeave = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.body) {
            return res.status(400).json({ message: 'Missing request body' });
        }

        const updateFields = {};

        if (req.body.fromDate) updateFields.fromDate = new Date(req.body.fromDate);
        if (req.body.toDate) updateFields.toDate = new Date(req.body.toDate);
        if (req.body.description) updateFields.description = req.body.description;

        const leave = await Leave.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        res.status(200).json({ message: 'Leave updated', data: leave });
    } catch (err) {
        console.error('Update Leave Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};


// Delete Leave
const deleteLeave = async (req, res) => {
    try {
        const { id } = req.params;

        const leave = await Leave.findByIdAndDelete(id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        res.status(200).json({ message: 'Leave deleted' });
    } catch (err) {
        console.error('Delete Leave Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createLeave,
    getLeaves,
    updateLeave,
    deleteLeave,
};
