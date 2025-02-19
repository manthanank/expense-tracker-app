const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmail = require("../services/emailService");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" }); // 409 Conflict
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Ensure bcrypt is working correctly
    const user = new User({ email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      token: token,
      expiresIn: 3600,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error(err); // Log the error to see the details
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      token: token,
      expiresIn: 3600,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "1h",
    });
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    // Generate reset URL based on environment
    const resetUrl =
      process.env.NODE_ENV === "development"
        ? `http://localhost:4200/reset-password/${token}`
        : `https://expense-tracker-app-manthanank.vercel.app/reset-password/${token}`;

    // email content
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

    // Send the email with the reset link
    res.json({ message: "Email sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
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
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
