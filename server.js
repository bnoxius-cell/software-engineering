const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./server/routes/auth");
const uploadRoutes = require("./server/routes/artwork");
const notificationRoutes = require("./server/routes/notifications");
const collectionRoutes = require("./server/routes/collections");
const adminRoutes = require("./server/routes/admin");
const connectDB = require("./server/config/db");
const Settings = require("./server/models/Settings");

const app = express();

app.use(express.json());
app.use(cors());

// Maintenance mode middleware — must run after body parser so req.path is reliable
const PUBLIC_PATHS = ["/api/auth/login", "/api/auth/register", "/api/admin/settings"];
app.use(async (req, res, next) => {
    try {
        // Skip health-check or asset paths
        if (req.path.startsWith("/Artworks") || req.path.startsWith("/avatars")) {
            return next();
        }
        if (req.path.startsWith("/api/admin")) {
            return next();
        }
        if (req.path.startsWith("/api/auth")) {
            return next();
        }

        const settings = await Settings.findOne();
        if (settings && settings.maintenanceMode === true) {
            // Allow staff (Admin/Faculty) through
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                const jwt = require("jsonwebtoken");
                const User = require("./server/models/User");
                const token = authHeader.split(" ")[1];
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.id).select("role");
                    if (user && ["Admin", "Faculty"].includes(user.role)) {
                        return next();
                    }
                    // Non-staff users should be blocked
                    return res.status(503).json({ message: "Server is under maintenance. Please try again later." });
                } catch {
                    return res.status(503).json({ message: "Server is under maintenance. Please try again later." });
                }
            }
            return res.status(503).json({ message: "Server is under maintenance. Please try again later." });
        }
        next();
    } catch (error) {
        console.error("Maintenance middleware error:", error);
        next();
    }
});

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
app.use("/api/admin", adminRoutes);

// Login and register
app.use("/api/auth", authRoutes);

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});