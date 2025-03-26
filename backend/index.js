const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const setupSwagger = require('./swagger');
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');
const adminRoutes = require('./routes/admin');

require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());

// Setup Swagger documentation
setupSwagger(app);

// Configure rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use("/api/", limiter);

// Add request logging in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/admin", adminRoutes);

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
