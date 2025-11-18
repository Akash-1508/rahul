const { getUsersByRole } = require("../models/users");

/**
 * Get users by role
 * GET /users?role=2
 */
const getUsers = async (req, res) => {
  try {
    const roleParam = req.query.role;
    
    if (!roleParam) {
      return res.status(400).json({ error: "Role parameter is required" });
    }

    const role = parseInt(roleParam, 10);
    
    if (isNaN(role) || (role !== 0 && role !== 1 && role !== 2)) {
      return res.status(400).json({ error: "Invalid role. Must be 0, 1, or 2" });
    }

    const users = await getUsersByRole(role);
    
    console.log(`[users] Controller: Found ${users.length} users with role ${role}`);
    
    // Remove passwordHash from response
    const safeUsers = users.map(({ passwordHash, ...user }) => ({
      ...user,
      _id: user._id?.toString(),
    }));

    console.log(`[users] Controller: Returning ${safeUsers.length} safe users`);
    return res.json(safeUsers);
  } catch (error) {
    console.error("[users] Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports = { getUsers };

