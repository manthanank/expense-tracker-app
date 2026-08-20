const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const helmet = require("helmet");
const setupSwagger = require('./swagger');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');
const adminRoutes = require('./routes/admin');
const insightRoutes = require('./routes/insight');
const passport = require('passport');
const configurePassport = require('./config/passport');

// Load environment variables
require("dotenv").config();

// Validate environment variables
const validateEnv = require('./config/validateEnv');
validateEnv();

const app = express();

// Only trust proxies in production
if (process.env.NODE_ENV === "production") {
  app.set('trust proxy', 1);
}

// Connect to MongoDB (non-blocking server startup check)
connectDB().catch((err) => console.error("Initial MongoDB connection failed:", err.message));

// Security headers middleware
app.use(helmet());

const allowedOrigins = [
  "http://localhost:4200",
  "https://expense-tracker-app-manthanank.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"));
    },
    credentials: true
  })
);

app.use(bodyParser.json());

// Database connection verification middleware (ensures connection is ready before route execution)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err);
    res.status(503).json({ message: 'Database is temporarily unavailable. Please try again shortly.' });
  }
});

// Setup Swagger documentation
setupSwagger(app);

// Configure rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    standardHeaders: true,
    message: { message: "Too many requests, please try again later" }
});

app.use("/api/", limiter);

// Add request logging in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Passport middleware
app.use(passport.initialize());
configurePassport();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/insights", insightRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.send("API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(
      `Swagger documentation available at ${process.env.BACKEND_URL || `http://localhost:${PORT}`}/api-docs`
    );
  });
}

module.exports = app;