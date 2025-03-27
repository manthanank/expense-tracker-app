const express = require('express');
const { getAIInsights } = require('../controllers/insightController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Apply authentication middleware
router.use(authMiddleware);

/**
 * @swagger
 * /api/insights/ai:
 *   get:
 *     summary: Get AI-generated insights for expenses
 *     tags: [Insights]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by expense category
 *     responses:
 *       200:
 *         description: AI-generated insights based on expense data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No expenses found for analysis
 *       500:
 *         description: Server error
 */
router.get('/ai', getAIInsights);

module.exports = router;