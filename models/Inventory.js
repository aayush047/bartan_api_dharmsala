const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  total: { type: Number, required: true },
  available: { type: Number, required: true },
});

module.exports = mongoose.model("InventoryItem", inventorySchema);
