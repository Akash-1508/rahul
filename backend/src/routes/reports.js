const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { getProfitLoss, getDashboardSummary, downloadBuyerConsumptionCsv } = require("../controllers/reports.controller");

const router = Router();

router.get("/profit-loss", requireAuth, getProfitLoss);
router.get("/dashboard-summary", requireAuth, getDashboardSummary);
router.get("/buyer-consumption/export", requireAuth, downloadBuyerConsumptionCsv);

module.exports = { router };

