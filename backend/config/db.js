const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    const conn = await mongoose.connect(mongoURI, {
      // These options may help with connection issues
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log("Connected to MongoDB database!");
    return conn;
  } catch (error) {
    console.error("Connection failed!", error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
