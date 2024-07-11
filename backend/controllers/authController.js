const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = new User({ email, password });
        await user.save();
        const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '1h' });
        res.json({ token: token, user: { id: user._id, email: user.email }});
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, 'your-secret-key', { expiresIn: '1h' });
        res.json({ token: token, user: { id: user._id, email: user.email }});
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
