// controllers/lendingController.js (Updated to enforce ownership)

const LendingItem = require("../models/Lending");
const InventoryItem = require("../models/Inventory");

// Helper function to extract Owner ID from request (used by all endpoints)
const getOwnerId = (req) => {
    if (req.query.ownerId) return req.query.ownerId;
    if (req.body.ownerId) return req.body.ownerId;
    // Check if ownerId is passed in the body for PUT/POST
    if (req.body.customer && req.body.functionName && req.body.ownerId) return req.body.ownerId;
    return null; 
}


// ---------------- GET Lendings (Owner-Filtered) ----------------
exports.getLendings = async (req, res) => {
  try {
    const ownerId = getOwnerId(req);
    if (!ownerId) {
        return res.status(401).json({ error: "Owner ID missing for authentication." });
    }

    // ✅ Filter by ownerId
    const lendings = await LendingItem.find({ ownerId: ownerId }); 
    res.json(lendings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------- POST Add Lending ----------------
exports.addLending = async (req, res) => {
  try {
    // ✅ Destructure and check ownerId
    const { customer, functionName, items, ownerId } = req.body;

    if (!ownerId) {
        return res.status(401).json({ error: "Owner ID missing for authentication." });
    }

    // Deduct inventory (Inventory must also belong to the owner)
    for (const i of items) {
        // ✅ Add ownerId check to find inventory item
      const inv = await InventoryItem.findOne({ _id: i.itemId, ownerId: ownerId }); 
      if (!inv) return res.status(404).json({ error: `Item ${i.name} not found or unauthorized` });
      if (i.qty > inv.available) return res.status(400).json({ error: `${i.name} quantity exceeds available` });
      inv.available -= i.qty;
      await inv.save();
    }

    const lending = new LendingItem({ customer, functionName, items, ownerId }); // ✅ Save with ownerId
    await lending.save();
    res.status(201).json(lending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------- POST Return Lending (Owner Check) ----------------
exports.returnLending = async (req, res) => {
  try {
    const ownerId = getOwnerId(req); // ownerId expected in query
    if (!ownerId) return res.status(401).json({ error: "Owner ID missing for authentication." });

    // ✅ Find lending item by ID AND ownerId
    const lending = await LendingItem.findOne({ _id: req.params.id, ownerId: ownerId });
    if (!lending) return res.status(404).json({ error: "Lending not found or unauthorized" });

    const returnedItems = req.body.returnedItems; // [{ itemId, qty }]
    for (const r of returnedItems) {
      const itemIndex = lending.items.findIndex(i => i.itemId.toString() === r.itemId);
      if (itemIndex === -1) continue;

      // Update returned qty
      lending.items[itemIndex].returned += r.qty;

      // Update inventory (Inventory must also belong to the owner)
        // ✅ Add ownerId check to update inventory
      const inv = await InventoryItem.findOne({ _id: r.itemId, ownerId: ownerId }); 
      if (inv) {
            inv.available += r.qty;
            await inv.save();
        } else {
            console.warn(`Inventory item ${r.itemId} not found for owner ${ownerId} during return.`);
        }
    }

    // Update status
    lending.status = lending.items.every(i => i.returned >= i.qty) ? "Completed" : "Pending";
    await lending.save();

    res.json(lending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------- DELETE Lending (Owner Check) ----------------
exports.deleteLending = async (req, res) => {
  try {
    const ownerId = getOwnerId(req); // ownerId expected in query
    if (!ownerId) return res.status(401).json({ error: "Owner ID missing for authentication." });

    // ✅ Find lending item by ID AND ownerId
    const lending = await LendingItem.findOne({ _id: req.params.id, ownerId: ownerId });
    if (!lending) return res.status(404).json({ error: "Lending not found or unauthorized" });

    // Optional: restore inventory for unreturned items (Inventory must belong to owner)
    for (const i of lending.items) {
        // ✅ Add ownerId check to update inventory
      const inv = await InventoryItem.findOne({ _id: i.itemId, ownerId: ownerId });
      if (inv) {
            inv.available += i.qty - i.returned;
            await inv.save();
        }
    }

    // ✅ Delete lending item by ID AND ownerId
    await LendingItem.findOneAndDelete({ _id: req.params.id, ownerId: ownerId });

    res.json({ message: "Lending deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};