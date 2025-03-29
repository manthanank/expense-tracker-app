const mongoose = require("mongoose");

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // This will automatically remove the document when the date expires
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistSchema);