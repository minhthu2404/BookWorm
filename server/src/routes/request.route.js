const express = require("express");
const requestController = require("../controllers/request.controller");

const router = express.Router();

router.post("/", requestController.checkout)
router.post("/single", requestController.checkoutSingle)
router.get("/", requestController.findAll);
router.put("/:id/approve", requestController.approve);
router.put("/:id/reject", requestController.reject);

module.exports = router;
