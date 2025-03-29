const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/tokenBlacklist");

// Regular auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }
    
    // Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ message: "Token has been invalidated" });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    
    // Add user info to request
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Special middleware for logout that doesn't validate the token
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
      // Just continue without auth for logout
      return next();
    }
    
    try {
      // Try to verify token but continue either way
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
      req.user = decoded;
    } catch (err) {
      // Token is invalid but we still allow the logout
      console.log("Invalid token in logout, continuing anyway");
    }
    
    next();
  } catch (err) {
    next();
  }
};

// Make sure to export both middlewares correctly
module.exports = { 
  authMiddleware,
  optionalAuthMiddleware
};
