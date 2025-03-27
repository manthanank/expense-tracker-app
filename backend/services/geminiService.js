const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

/**
 * Initialize the Google Generative AI with API key if available
 */
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Generate insights from expenses data using Gemini AI
 * @param {Array} expenses - User's expense data
 * @returns {Promise<Object>} - AI generated insights
 */
const generateExpenseInsights = async (expenses) => {
  try {
    // Check if Gemini API is configured
    if (!genAI) {
      return {
        error: "AI insights are unavailable - API key not configured",
        fallbackInsights: generateFallbackInsights(expenses)
      };
    }

    // Get the model (Gemini Pro is suitable for text generation)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Format expense data for better analysis
    const expenseData = expenses
      .map(
        (exp) =>
          `Amount: $${exp.amount}, Category: ${exp.category}, Date: ${
            new Date(exp.date).toISOString().split("T")[0]
          }, Description: ${exp.description}`
      )
      .join("\n");

    // Prompt with specific tasks for the AI - explicitly request not to use markdown formatting
    const prompt = `
      Analyze these expense records and provide useful insights:
      ${expenseData}
      
      Please include in your analysis:
      1. Top spending categories
      2. Monthly spending trends
      3. Unusual spending patterns
      4. 2-3 personalized money-saving suggestions
      5. Brief budget health assessment
      
      Return the response as clean JSON with these keys: "topCategories", "trends", "anomalies", "suggestions", "budgetHealth".
      DO NOT include any markdown formatting, code block indicators, or backticks in your response.
      Just return the raw JSON object.
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Process the response to remove any markdown formatting if present
    let processedText = text;

    // Check if the response contains markdown code block
    if (text.includes("```json")) {
      // Extract content between code block markers
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        processedText = jsonMatch[1].trim();
      }
    }

    // Parse the JSON from the processed response
    try {
      return JSON.parse(processedText);
    } catch (e) {
      console.error("Error parsing Gemini response as JSON:", e);

      // Second attempt: Try to sanitize the response further
      try {
        // Remove any remaining backticks or markdown artifacts
        const sanitizedText = processedText
          .replace(/^```(.*)$/gm, "") // Remove any markdown code markers
          .replace(/^```$/gm, "") // Remove closing markers
          .trim();

        return JSON.parse(sanitizedText);
      } catch (e2) {
        console.error("Second parsing attempt failed:", e2);

        // If all parsing attempts fail, return the raw response for debugging
        return {
          error: "Could not generate structured insights",
          rawResponse: text,
          fallbackInsights: generateFallbackInsights(expenses)
        };
      }
    }
  } catch (error) {
    console.error("Error generating insights with Gemini:", error);
    return {
      error: "Failed to generate AI insights: " + error.message,
      fallbackInsights: generateFallbackInsights(expenses)
    };
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
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  // Sort categories by amount spent
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }));
  
  // Group by month
  const monthlySpending = {};
  expenses.forEach(exp => {
    const date = new Date(exp.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + exp.amount;
  });
  
  // Convert to array and sort chronologically
  const trends = Object.entries(monthlySpending)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, amount]) => ({ month, amount }));
  
  return {
    topCategories,
    trends,
    suggestions: [
      "Consider reviewing spending in your top category to find potential savings",
      "Track your expenses regularly to maintain awareness of your spending habits",
      "Set budget targets for each spending category"
    ],
    budgetHealth: `You've tracked ${expenses.length} expenses totaling $${totalSpent.toFixed(2)}. Continue monitoring your spending to improve financial awareness.`
  };
};

module.exports = {
  generateExpenseInsights,
};
