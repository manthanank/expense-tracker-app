const User = require("../models/user");
const Expense = require("../models/expense");

// Helper to escape regex special characters
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Get all users with pagination and search
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search ? String(req.query.search).trim() : "";

    // Create search query with escaped regex to prevent ReDoS
    const searchQuery = search
      ? {
          $or: [
            { email: { $regex: escapeRegex(search), $options: "i" } },
            { role: { $regex: escapeRegex(search), $options: "i" } },
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
    const { id } = req.params;
    const expenses = await Expense.find({ user: id, deletedAt: null }).sort({ date: -1 });
    res.status(200).json({ expenses });
  } catch (error) {
    console.error("Error getting user expenses:", error);
    res.status(500).json({ message: "Failed to fetch user expenses" });
  }
};

// Get platform statistics
exports.getStats = async (req, res) => {
  try {
    const [userCount, expenseCount, totalAgg, categoryDistribution, newUsers] = await Promise.all([
      User.countDocuments(),
      Expense.countDocuments({ deletedAt: null }),
      Expense.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const totalAmount = totalAgg.length > 0 ? totalAgg[0].total : 0;

    res.json({
      userCount,
      expenseCount,
      totalAmount,
      categoryDistribution,
      newUsers,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
