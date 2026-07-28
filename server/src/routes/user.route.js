const express = require("express");
const users = require("../controllers/user.controller");
const userController = require("../controllers/user.controller");
const router = express.Router();

router.post("/", users.create);
router.put("/:id", users.update);
router.get("/count", userController.countAll);
router.get("/:id", users.findById);
router.get("/", users.findAll);
router.delete("/:id", userController.delete);

module.exports = router;