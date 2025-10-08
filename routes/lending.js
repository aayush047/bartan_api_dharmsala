const express = require("express");
const router = express.Router();
const controller = require("../controllers/lendingController");

router.get("/", controller.getLendings);
router.post("/", controller.addLending);
router.post("/return/:id", controller.returnLending);

// Add this DELETE route
router.delete("/:id", controller.deleteLending);

module.exports = router;
