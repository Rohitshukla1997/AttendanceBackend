// config/db.js
// const mongoose = require("mongoose");

// const dbConnect = async () => {
//     try {
//         await mongoose.connect(process.env.DB_URI)
//         console.log("CONNECT TO DATABASE")
//     } catch (error) {
//         console.error("DATABASE CONNECTION ERROR:", error.message);
//     }
// };

// module.exports = dbConnect;

const mongoose = require("mongoose");

const dbConnect = async () => {
    const dbUri = process.env.DB_URI;
    console.log("🔍 DB_URI from environment:", dbUri); // TEMP DEBUG

    if (!dbUri) {
        console.error("❌ DATABASE CONNECTION ERROR: DB_URI is undefined!");
        process.exit(1); // Prevent the server from continuing with invalid config
    }

    try {
        await mongoose.connect(dbUri);
        console.log("✅ CONNECTED TO DATABASE");
    } catch (error) {
        console.error("❌ DATABASE CONNECTION ERROR:", error.message);
    }
};

module.exports = dbConnect;
