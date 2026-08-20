const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../services/emailService");
const TokenBlacklist = require("../models/tokenBlacklist");

const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || (
    process.env.NODE_ENV === "production"
      ? "https://expense-tracker-app-manthanank.vercel.app"
      : "http://localhost:4200"
  );
};

// Helper: generate an opaque refresh token and return its hash + raw value
const generateRefreshToken = () => {
  const raw = crypto.randomBytes(40).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
};

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(email).trim())) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email: normalizedEmail, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();
    user.refreshToken = refreshHash;
    await user.save();

    res.json({
      token,
      refreshToken: refreshRaw,
      expiresIn: 900,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    const { raw: refreshRaw, hash: refreshHash } = generateRefreshToken();
    user.refreshToken = refreshHash;
    await user.save();

    res.json({
      token,
      refreshToken: refreshRaw,
      expiresIn: 900,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  const genericMessage = "If this email is registered, a password reset link has been sent.";

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Uniform response prevents user enumeration
      return res.json({ message: genericMessage });
    }
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const frontendUrl = getFrontendUrl();
    const resetUrl = `${frontendUrl}/reset-password/${token}`;

    const message = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .email-container {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f4f4f4;
                }
                .header {
                    background-color: #007bff;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 5px 5px 0 0;
                }
                .content {
                    background-color: white;
                    padding: 30px;
                    border-radius: 0 0 5px 5px;
                }
                .button {
                    display: inline-block;
                    padding: 15px 25px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                    text-align: center;
                }
                .button a {
                    color: white;
                    text-decoration: none;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    color: #777;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <h2>Hello,</h2>
                    <p>We received a request to reset the password for your Expense Tracker account.</p>
                    <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
                    <center>
                        <div class="button">
                            <a href="${resetUrl}">Reset Password</a>
                        </div>
                    </center>
                    <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                </div>
                <div class="footer">
                    <p>This email was sent by Expense Tracker App</p>
                    <p>© ${new Date().getFullYear()} Expense Tracker. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await sendEmail(user.email, "Password Reset", message);
    res.json({ message: genericMessage });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = null; // Revoke refresh token on password reset
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(200).json({ message: "Logged out successfully" });
    }
    let tokenData;
    try {
      tokenData = jwt.decode(token);
    } catch (err) {
      console.error("Error decoding token:", err);
    }
    const expiresAt = tokenData?.exp
      ? new Date(tokenData.exp * 1000)
      : new Date(Date.now() + 3600000);
    const blacklistedToken = new TokenBlacklist({ token, expiresAt });
    await blacklistedToken.save();

    // Also revoke the stored refresh token for this user
    if (tokenData?.id) {
      await User.findByIdAndUpdate(tokenData.id, { refreshToken: null });
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(200).json({ message: "Logged out successfully" });
  }
};

exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }
  try {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await User.findOne({ refreshToken: hash });
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
    // Issue a new short-lived access token with full identity claims
    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    // Rotate the refresh token
    const { raw: newRefreshRaw, hash: newRefreshHash } = generateRefreshToken();
    user.refreshToken = newRefreshHash;
    await user.save();
    res.json({
      token: newAccessToken,
      refreshToken: newRefreshRaw,
      expiresIn: 900,
      user: { id: user._id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.validateToken = async (req, res) => {
  return res.status(200).json({ valid: true, user: req.user });
};

exports.socialAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    
    // Create and sign JWT with claims
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/auth/social?token=${token}&expiresIn=3600&userId=${user._id}&email=${encodeURIComponent(user.email)}&role=${user.role}`);
  } catch (error) {
    console.error("Social auth error:", error);
    const frontendUrl = getFrontendUrl();
    res.redirect(`${frontendUrl}/login?error=Authentication failed`);
  }
};
