const express = require("express");
const bookController = require("../controllers/book.controller");
const router = express.Router();

router.get("/", bookController.findAll);
router.get("/count", bookController.countAll);
router.get("/newbooks", bookController.getNewBooks);
router.get("/related", bookController.getRelatedBooks);
router.get("/categories", bookController.getCategories);
router.get("/:id", bookController.findOne);

router.post("/", bookController.create);
router.put("/:id", bookController.update);
router.delete("/:id", bookController.delete);

module.exports = router;