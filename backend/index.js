const express = require('express');
const bodyParser = require('body-parser');
const cors = require("cors");
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');
const mongoose = require('mongoose');

const app = express();

require("dotenv").config();

const dbUser = process.env.MONGODB_USER;
const dbPassword = process.env.MONGODB_PASSWORD;

// Connect to MongoDB
mongoose
    .connect(
        `mongodb+srv://${dbUser}:${dbPassword}@cluster0.re3ha3x.mongodb.net/expense-tracker-app`,
        { useNewUrlParser: true, useUnifiedTopology: true } // Add these options for MongoDB connection
    )
    .then(() => {
        console.log("Connected to MongoDB database!");
    })
    .catch((error) => {
        console.error("Connection failed!", error); // Log the error for better debugging
    });

app.use(
    cors({
        origin: "*",
    })
);

app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
