const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../services/emailService');

exports.signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' }); // 409 Conflict
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Ensure bcrypt is working correctly
        const user = new User({ email, password: hashedPassword });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        res.json({ token: token, expiresIn: 3600, user: { id: user._id, email: user.email } });
    } catch (err) {
        console.error(err); // Log the error to see the details
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Verify the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        res.json({ token: token, expiresIn: 3600, user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        const resetUrl = window.location.hostname === 'localhost' ? `http://localhost:4200/reset/${token}` : `https://expense-tracker-app-manthanank.vercel.app/reset/${token}`;
        const message = `You have requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

        await sendEmail(user.email, 'Password Reset', message);

        // Send the email with the reset link
        res.json({ message: 'Email sent' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Password updated' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
}