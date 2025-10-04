const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./config/db");

const inventoryRoutes = require("./routes/inventory");
const lendingRoutes = require("./routes/lending");

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/inventory", inventoryRoutes);
app.use("/api/lending", lendingRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});