const { Router } = require("express");
const { listSellers } = require("../controllers/sellers.controller");

const router = Router();

router.get("/", listSellers);

module.exports = { router };
