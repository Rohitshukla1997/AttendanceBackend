// config/db.js
const mongoose = require('mongoose');

// Database URL (Change this to your MongoDB URI, for Atlas or local MongoDB)
const dbURI = process.env.DB_URI || 'mongodb://localhost:27017/mydb';

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
