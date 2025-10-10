// controllers/inventoryController.js (Updated to enforce ownership)

const InventoryItem = require("../models/Inventory");

// Helper function to extract Owner ID from request (used by all endpoints)
const getOwnerId = (req) => {
    if (req.query.ownerId) return req.query.ownerId;
    if (req.body.ownerId) return req.body.ownerId;
    return null; 
}


// ---------------- GET Inventory (Owner-Filtered) ----------------
exports.getInventory = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
        return res.status(401).json({ error: "Owner ID missing for authentication." });
    }

    // ✅ Filter by ownerId
    const items = await InventoryItem.find({ ownerId: ownerId }); 
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------- POST Add Inventory ----------------
exports.addInventory = async (req, res) => {
  try {
    // ✅ Destructure and check ownerId
    const { name, type, total, available, ownerId } = req.body; 

    if (!ownerId) {
        return res.status(401).json({ error: "Owner ID missing for authentication." });
    }

    const item = new InventoryItem({ name, type, total, available, ownerId }); // ✅ Save with ownerId
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------- PUT Update Inventory (Owner Check) ----------------
exports.updateInventory = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
        return res.status(401).json({ error: "Owner ID missing for authentication." });
    }
    
    const { name, type, total, available } = req.body;
    
    // Prevent ownerId from being updated
    delete req.body.ownerId;

    // ✅ Find and Update by ID AND ownerId
    const item = await InventoryItem.findOneAndUpdate(
      { _id: req.params.id, ownerId: ownerId }, 
      { name, type, total, available }, 
      { new: true }
    );
    
    if (!item) return res.status(404).json({ error: "Item not found or unauthorized" }); // Update response
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------- DELETE Inventory (Owner Check) ----------------
exports.deleteInventory = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
        return res.status(401).json({ error: "Owner ID missing for authentication." });
    }

    // ✅ Find and Delete by ID AND ownerId
    const item = await InventoryItem.findOneAndDelete({ _id: req.params.id, ownerId: ownerId }); 
    
    if (!item) return res.status(404).json({ error: "Item not found or unauthorized" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }                                                                                           
};