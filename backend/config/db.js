const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    const conn = await mongoose.connect(mongoURI);

    console.log("Connected to MongoDB database!");
    return conn;
  } catch (error) {
    console.error("Connection failed!", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
