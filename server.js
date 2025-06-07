require('dotenv').config()
const cookieParser = require("cookie-parser");
const express = require('express');
const cors = require("cors");
const connectDB = require('./Database/dbConnect');
const route = require("./Routes/route");

const app = express();
const port = process.env.PORT;
app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

// Middleware
app.use(express.json());

// Sample route
app.get("/", (req, res) => {
    res.status(200).send("Attendance Server is running");
});

// Routes
app.use("/api", route);

// Sample POST route
app.post('/data', (req, res) => {
    const data = req.body;
    res.json({ message: 'Data received', data });
});

// Start server
app.listen(port, async () => {
    const key = Buffer.from(process.env.ENCRYPTION_KEY, "utf8");
    console.log("Key Length (bytes):", key.length);
    await connectDB();
    console.log(`Server is running on http://localhost:${port}`);
});
