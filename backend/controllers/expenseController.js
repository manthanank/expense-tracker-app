const Expense = require('../models/expense');

exports.addExpense = async (req, res) => {
    const { description, amount, category } = req.body;
    try {
        const date = new Date();
        const expense = new Expense({
            user: req.user.id,
            description,
            amount,
            date,
            category,
        });
        await expense.save();
        res.json(expense);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getExpenses = async (req, res) => {
    const { startDate, endDate, period } = req.query;
    const filter = { user: req.user.id };
    const now = new Date();
    let start, end;

    if (period) {
        switch (period) {
            case 'week':
                start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // Start of the week (Monday)
                end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - now.getDay())); // End of the week (Sunday)
                end.setDate(end.getDate() + 6); // End of the week (Sunday)
                break;
            case 'month':
                start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1); // Start of the month
                end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of the month
                break;
            case '3months':
                start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth() - 2, 1); // Start of the 3 months period
                end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of the month
                break;
            case 'custom':
                if (startDate && endDate) {
                    start = new Date(startDate);
                    end = new Date(endDate);
                } else {
                    return res.status(400).json({ message: 'Please provide startDate and endDate for custom period' });
                }
                break;
            default:
                return res.status(400).json({ message: 'Invalid period. Choose from week, month, 3months, or custom.' });
        }
    }

    if (start && end) {
        filter.date = { $gte: start, $lte: end };
    }

    try {
        const expenses = await Expense.find(filter).sort({ date: -1 }); // Sort by date in descending order
        const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0); // Assuming `amount` is a field in your Expense model
        res.json({ totalAmount, expenses });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const { description, amount, date, category } = req.body;
    try {
        const expense = await Expense.findByIdAndUpdate(
            id,
            { description, amount, date, category },
            { new: true }
        );
        res.json(expense);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        await Expense.findByIdAndDelete(id);
        res.json({ message: 'Expense removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
