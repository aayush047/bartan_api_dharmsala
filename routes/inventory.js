const express = require("express");
const router = express.Router();
const controller = require("../controllers/inventoryController");

router.get("/", controller.getInventory);
router.post("/", controller.addInventory);
router.put("/:id", controller.updateInventory);
router.delete("/:id", controller.deleteInventory);

module.exports = router;
