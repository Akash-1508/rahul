const { Router } = require("express");
const { listBuyers } = require("../controllers/buyers.controller");

const router = Router();

router.get("/", listBuyers);

module.exports = { router };

