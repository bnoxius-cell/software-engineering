const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./server/routes/auth");
const uploadRoutes = require("./server/routes/artwork");
const notificationRoutes = require("./server/routes/notifications");
const collectionRoutes = require("./server/routes/collections");
const connectDB = require("./server/config/db");

const app = express();

app.use(express.json());
app.use(cors());

// 1. Force the exact absolute path to the folder
const artworksPath = path.join(__dirname, "public", "Artworks");
// 2. Log it so we can see EXACTLY where Express is looking!
console.log("Express is serving images from:", artworksPath);
// 3. Serve it
app.use("/Artworks", express.static(artworksPath));

// Serve avatars
const avatarsPath = path.join(__dirname, "public", "avatars");
console.log("Express is serving avatars from:", avatarsPath);
app.use("/avatars", express.static(avatarsPath));

app.use("/api/artworks", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/collections", collectionRoutes);

// Login and register
app.use("/api/auth", authRoutes);

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});