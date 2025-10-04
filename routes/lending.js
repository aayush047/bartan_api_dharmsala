const express = require("express");
const router = express.Router();
const controller = require("../controllers/lendingController");

router.get("/", controller.getLendings);
router.post("/", controller.addLending);
router.post("/return/:id", controller.returnLending);

module.exports = router;
