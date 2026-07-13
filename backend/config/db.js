const mongoose = require("mongoose");

// Disable internal buffering — fail fast if DB is not connected (better than 10s silent timeout)
mongoose.set('bufferCommands', false);

let connectionPromise = null;

const connectDB = () => {
  const mongoURI = process.env.MONGO_URI;

  // Already connected — reuse
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  // Connection in progress — wait for same promise
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!mongoURI) {
    console.error("Error: MONGO_URI is not defined in environment variables.");
    return Promise.reject(new Error("MONGO_URI not set"));
  }

  const isServerless = !!process.env.VERCEL;

  connectionPromise = mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    minPoolSize: 1,
    maxPoolSize: isServerless ? 10 : 100,
    maxIdleTimeMS: 10000,
  })
  .then((conn) => {
    console.log("Connected to MongoDB database!");
    return conn;
  })
  .catch((error) => {
    console.error("Connection failed!", error);
    connectionPromise = null; // reset cache on failure so next request retries
    throw error;
  });

  return connectionPromise;
};

module.exports = connectDB;
