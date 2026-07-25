const express = require("express");
const requests = require("../controllers/request.controller");
const router = express.Router();

router.get("/", requests.findAll);

module.exports = router;