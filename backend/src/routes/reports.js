const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { getProfitLoss } = require("../controllers/reports.controller");

const router = Router();

router.get("/profit-loss", requireAuth, getProfitLoss);

module.exports = { router };

