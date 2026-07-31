const express = require("express");
const ledgerController = require("../controllers/ledger.controller");

const router = express.Router();

router.get("/stats/trend", ledgerController.getBorrowTrend);
router.get("/user/:id", ledgerController.findAllByUser);
router.get("/", ledgerController.findAll);

module.exports = router;
