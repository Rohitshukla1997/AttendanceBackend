require('dotenv').config()
const express = require('express');
const connectDB = require('./Database/db');
const app = express();
const port = process.env.PORT;
// Middleware
app.use(express.json());

// Sample route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Sample POST route
app.post('/data', (req, res) => {
    const data = req.body;
    res.json({ message: 'Data received', data });
});

// Start server
app.listen(port, async () => {
    await connectDB();
    console.log(`Server is running on http://localhost:${port}`);
});
