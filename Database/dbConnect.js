// config/db.js
const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log("CONNECT TO DATABASE")
    } catch (error) {
        console.error("DATABASE CONNECTION ERROR:", error.message);
    }
};

module.exports = dbConnect;