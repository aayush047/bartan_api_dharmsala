const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./config/db");

// Import routes
const inventoryRoutes = require("./routes/inventory");
const lendingRoutes = require("./routes/lending");

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Root route (to check if server is running)
app.get("/", (req, res) => {
  res.send("✅ Meri Dharamshala Backend is running 🚀");
});

// API Routes
app.use("/api/inventory", inventoryRoutes);
app.use("/api/lending", lendingRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
