const { Router } = require("express");
const { getUsers } = require("../controllers/users.controller");
const { requireAuth } = require("../middleware/auth");

const router = Router();

// Get users by role (requires authentication)
router.get("/", requireAuth, getUsers);

module.exports = { router };

