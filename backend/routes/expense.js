const express = require('express');
const {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/', addExpense);
router.get('/', getExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
