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

// Connect to MongoDB
connectDB();

// Security headers middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? "https://expense-tracker-app-manthanank.vercel.app" 
      : "*",
    credentials: true
  })
);

app.use(bodyParser.json());

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

app.get("/", (req, res) => {
  res.send("API is running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Swagger documentation available at ${process.env.BASE_URL}/api-docs`
  );
});
