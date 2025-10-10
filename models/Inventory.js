// models/Inventory.js (Updated)

const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  total: { type: Number, required: true },
  available: { type: Number, required: true },
  
  // ✅ NEW FIELD: To track which user owns this inventory item
  ownerId: { type: String, required: true, index: true }, 

});

module.exports = mongoose.model("InventoryItem", inventorySchema);