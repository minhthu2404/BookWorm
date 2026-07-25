const express = require("express");
const ledgers = require("../controllers/ledger.controller");
const router = express.Router();

router.get("/", ledgers.findAll);

module.exports = router;