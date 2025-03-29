const express = require('express');
const {
    addExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
} = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware').authMiddleware;
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *         - category
 *       properties:
 *         description:
 *           type: string
 *           description: Description of the expense 
 *         amount:
 *           type: number
 *           description: Amount spent
 *         category:
 *           type: string
 *           enum: [Groceries, Leisure, Electronics, Utilities, Clothing, Health, Others]
 *           description: Category of the expense
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the expense
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Successfully created expense
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', addExpense);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses with optional filters
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering expenses
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering expenses
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, 3months, 6months, custom]
 *         description: Predefined period for filtering
 *     responses:
 *       200:
 *         description: List of expenses
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getExpenses);

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get expense by ID
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Updated expense details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Expense not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteExpense);

module.exports = router;
