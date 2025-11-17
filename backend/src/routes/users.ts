import { Router } from "express";
import { getUsers } from "../controllers/users.controller";
import { requireAuth } from "../middleware/auth";

export const router = Router();

// Get users by role (requires authentication)
router.get("/", requireAuth, getUsers);

