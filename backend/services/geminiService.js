const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

/**
 * Initialize the Google Generative AI with API key if available
 */
let genAI = null;
let model = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-pro" });
}

/**
 * Generate insights from expenses data using Gemini AI
 * @param {Array} expenses - User's expense data
 * @returns {Promise<Object>} - AI generated insights
 */
const generateExpenseInsights = async (expenses) => {
  if (!genAI || !model) {
    return generateFallbackInsights(expenses);
  }

  try {
    // Format expense data
    const expenseData = expenses
      .map(
        (exp) =>
          `Amount: ₹${exp.amount}, Category: ${exp.category}, Date: ${
            new Date(exp.date).toISOString().split("T")[0]
          }, Description: ${exp.description}`
      )
      .join("\n");

    // Create AI prompt
    const prompt = `
      Analyze these expense records and provide useful insights:
      ${expenseData}
      
      Please include in your analysis:
      1. Top spending categories
      2. Monthly spending trends
      3. Unusual spending patterns
      4. 2-3 personalized money-saving suggestions
      5. Brief budget health assessment
      
      Return the response as a JSON object with the following structure:
      {
        "topCategories": [{"category": string, "amount": number}],
        "trends": [{"month": string, "amount": number}],
        "unusualPatterns": string,
        "suggestions": [string],
        "budgetHealth": string
      }
      
      Important: Use the Indian Rupee symbol (₹) for any currency values in the response and make sure not to include any currency symbols in the numeric values of the JSON.
    `;

    // Generate AI content
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return generateFallbackInsights(expenses);
    }
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return generateFallbackInsights(expenses);
  }
};

/**
 * Generate basic insights without AI when Gemini is unavailable
 * @param {Array} expenses - User's expense data
 * @returns {Object} - Basic statistical insights
 */
const generateFallbackInsights = (expenses) => {
  // Calculate total spent
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group by category and calculate totals
  const categoryTotals = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + exp.amount;
  });

  // Sort categories by amount spent
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }));

  // Group by month
  const monthlySpending = {};
  expenses.forEach((exp) => {
    const date = new Date(exp.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
    monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + exp.amount;
  });

  // Convert to array and sort chronologically
  const trends = Object.entries(monthlySpending)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, amount]) => ({ month, amount }));

  return {
    topCategories,
    trends,
    unusualPatterns: "No unusual patterns detected with basic analysis.",
    suggestions: [
      "Consider reviewing spending in your top category to find potential savings",
      "Track your expenses regularly to maintain awareness of your spending habits",
      "Set budget targets for each spending category",
    ],
    budgetHealth: `You've tracked ${
      expenses.length
    } expenses totaling ₹${totalSpent.toFixed(
      2
    )}. Continue monitoring your spending to improve financial awareness.`,
  };
};

module.exports = {
  generateExpenseInsights,
};
