const User = require("../models/user");
const Expense = require("../models/expense");

// Get all users with pagination and search
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    // Create search query
    const searchQuery = search
      ? {
          $or: [
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    // Get total count for pagination
    const totalUsers = await User.countDocuments(searchQuery);

    // Get paginated and filtered users
    const users = await User.find(searchQuery)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get user expenses
exports.getUserExpenses = async (req, res) => {
  try {
    const { userId } = req.params;
    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
    res.status(200).json({ expenses });
  } catch (error) {
    console.error("Error getting user expenses:", error);
    res.status(500).json({ message: "Failed to fetch user expenses" });
  }
};

// Get platform statistics
exports.getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const expenseCount = await Expense.countDocuments();

    // Total expense amount across platform
    const expenses = await Expense.find();
    const totalAmount = expenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );

    // Get expense distribution by category
    const categoryDistribution = await Expense.aggregate([
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);

    // Recent registrations - last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    res.json({
      userCount,
      expenseCount,
      totalAmount,
      categoryDistribution,
      newUsers,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
