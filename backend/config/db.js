const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      minPoolSize: 1, // Maintain at least one connection
      maxPoolSize: 10, // Cap at 10 connections
      maxIdleTimeMS: 10000, // Close idle connections after 10 seconds
    });

    console.log("Connected to MongoDB database!");
    return conn;
  } catch (error) {
    console.error("Connection failed!", error);
    // Don't exit the process in serverless environment
    throw error;
  }
};

module.exports = connectDB;
