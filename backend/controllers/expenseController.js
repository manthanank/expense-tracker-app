const Expense = require('../models/expense');

exports.addExpense = async (req, res) => {
    const { description, amount, category } = req.body;
    try {
        const date = new Date();
        console.log(date);
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
    const { startDate, endDate } = req.query;
    const filter = { user: req.user.id };
    if (startDate && endDate) {
        filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    try {
        const expenses = await Expense.find(filter);
        res.json(expenses);
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
