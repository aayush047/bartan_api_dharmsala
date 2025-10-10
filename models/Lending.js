// models/Lending.js (Updated)

const mongoose = require("mongoose");

const lendingSchema = new mongoose.Schema({
  customer: { type: String, required: true },
  functionName: { type: String, required: true },
  items: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem", required: true },
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      returned: { type: Number, default: 0 },
    },
  ],
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
  
  // ✅ NEW FIELD: To track which user owns this lending record
  ownerId: { type: String, required: true, index: true }, 

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LendingItem", lendingSchema);