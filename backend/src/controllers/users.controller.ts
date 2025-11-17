import { Request, Response } from "express";
import { getUsersByRole, UserRoles } from "../models/users";

/**
 * Get users by role
 * GET /users?role=2
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const roleParam = req.query.role;
    
    if (!roleParam) {
      return res.status(400).json({ error: "Role parameter is required" });
    }

    const role = parseInt(roleParam as string, 10);
    
    if (isNaN(role) || (role !== 0 && role !== 1 && role !== 2)) {
      return res.status(400).json({ error: "Invalid role. Must be 0, 1, or 2" });
    }

    const users = await getUsersByRole(role as 0 | 1 | 2);
    
    // Remove passwordHash from response
    const safeUsers = users.map(({ passwordHash, ...user }) => ({
      ...user,
      _id: user._id?.toString(),
    }));

    return res.json(safeUsers);
  } catch (error: any) {
    console.error("[users] Error fetching users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

