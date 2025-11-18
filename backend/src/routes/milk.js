const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { createMilkPurchase, createMilkSale, listMilkTransactions } = require("../controllers/milk.controller");

const router = Router();

router.get("/", requireAuth, listMilkTransactions);
router.post("/sale", requireAuth, createMilkSale);
router.post("/purchase", requireAuth, createMilkPurchase);

module.exports = { router };

