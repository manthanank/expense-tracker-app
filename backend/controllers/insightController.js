const Expense = require("../models/expense");
const { generateExpenseInsights } = require("../services/geminiService");

exports.getAIInsights = async (req, res) => {
  try {
    // Get user ID from the authenticated request
    const userId = req.user.id;
    
    // Optional query parameters for filtering
    const { startDate, endDate, category } = req.query;
    
    // Build query
    const query = { user: userId };
    
    // Add date filtering if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Add category filtering if provided
    if (category) {
      query.category = category;
    }
    
    // Get expenses for analysis
    const expenses = await Expense.find(query).sort({ date: -1 });
    
    if (expenses.length === 0) {
      return res.status(404).json({ 
        message: "No expenses found for analysis. Please add more expenses." 
      });
    }
    
    // Check if API key exists before trying to use Gemini
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        message: "Gemini API key is not configured on the server."
      });
    }
    
    // Generate insights using Gemini AI
    const insights = await generateExpenseInsights(expenses);
    
    // Return the insights
    res.status(200).json({
      insights,
      expenseCount: expenses.length,
      period: {
        from: startDate || "All time",
        to: endDate || "Present"
      }
    });
    
  } catch (error) {
    console.error("Error getting AI insights:", error);
    res.status(500).json({ message: error.message || "Failed to generate AI insights" });
  }
};