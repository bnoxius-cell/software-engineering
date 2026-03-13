const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./server/routes/auth");
const uploadRoutes = require("./server/routes/uploads");
const connectDB = require("./server/config/db");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/Artworks", express.static(path.join(__dirname, "public/Artworks")));

app.use("/api/auth", authRoutes);

app.use("/api/artworks", uploadRoutes);

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});