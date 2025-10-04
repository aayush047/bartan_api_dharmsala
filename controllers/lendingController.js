const LendingItem = require("../models/Lending");
const InventoryItem = require("../models/Inventory");

exports.getLendings = async (req, res) => {
  try {
    const lendings = await LendingItem.find();
    res.json(lendings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addLending = async (req, res) => {
  try {
    const { customer, functionName, items } = req.body;

    // Deduct inventory
    for (const i of items) {
      const inv = await InventoryItem.findById(i.itemId);
      if (!inv) return res.status(404).json({ error: `Item ${i.name} not found` });
      if (i.qty > inv.available) return res.status(400).json({ error: `${i.name} quantity exceeds available` });
      inv.available -= i.qty;
      await inv.save();
    }

    const lending = new LendingItem({ customer, functionName, items });
    await lending.save();
    res.status(201).json(lending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.returnLending = async (req, res) => {
  try {
    const lending = await LendingItem.findById(req.params.id);
    if (!lending) return res.status(404).json({ error: "Lending not found" });

    const returnedItems = req.body.returnedItems; // [{ itemId, qty }]
    for (const r of returnedItems) {
      const itemIndex = lending.items.findIndex(i => i.itemId.toString() === r.itemId);
      if (itemIndex === -1) continue;

      // Update returned qty
      lending.items[itemIndex].returned += r.qty;

      // Update inventory
      const inv = await InventoryItem.findById(r.itemId);
      if (inv) inv.available += r.qty;
      await inv.save();
    }

    // Update status
    lending.status = lending.items.every(i => i.returned >= i.qty) ? "Completed" : "Pending";
    await lending.save();

    res.json(lending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
