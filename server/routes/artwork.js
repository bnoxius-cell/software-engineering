const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken"); 
const Artwork = require("../models/Artwork"); // Corrected path to models
const User = require("../models/User");       // Corrected path to models

// 1. Set up the upload directory
const uploadDir = path.join(__dirname, "../../public/Artworks");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 3. JWT Authentication Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1]; 
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Token is invalid or expired!" });
      req.user = user; 
      next();
    });
  } else {
    return res.status(401).json({ message: "You are not authenticated!" });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const currentUser = await User.findById(userId);

    if (!currentUser || currentUser.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Failed to verify admin access." });
  }
};

// ==========================================
// 4. THE MISSING GET ROUTE (Fetches the art)
// ==========================================
router.get("/", async (req, res) => {
  try {
    const artworks = await Artwork.find({ status: "published" });
    res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 4.1. ADMIN ROUTE (Fetches pending art)
// ==========================================
router.get("/admin/pending", verifyToken, requireAdmin, async (req, res) => {
  try {
    const artworks = await Artwork.find({ status: "pending" });
    res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 4.2. ADMIN ROUTE (Update artwork status)
// ==========================================
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, medium, description, tags, artistName } = req.body;
    const updatedArtwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { title, medium, description, tags, artistName },
      { new: true, runValidators: true }
    );

    if (!updatedArtwork) {
      return res.status(404).json({ message: "Artwork not found." });
    }

    res.status(200).json(updatedArtwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/status", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedArtwork = await Artwork.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    res.status(200).json(updatedArtwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 4.3. ADMIN ROUTE (Fetches ALL art regardless of status)
// ==========================================
router.get("/all", verifyToken, async (req, res) => {
  try {
    // Fetches everything, sorted by newest first
    const artworks = await Artwork.find({}).sort({ createdAt: -1 });
    res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 4.4. ADMIN ROUTE (Full Edit / Update Artwork)
// ==========================================
router.put("/:id", verifyToken, upload.single("artworkImage"), async (req, res) => {
  try {
    // Grab the text fields from the request
    const updateData = {
      title: req.body.title,
      medium: req.body.medium,
      status: req.body.status,
      description: req.body.description
    };

    // If the admin uploaded a NEW image, update the image path too
    if (req.file) {
      updateData.image = `/Artworks/${req.file.filename}`;
    }

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true } // Returns the updated document
    );

    if (!updatedArtwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    res.status(200).json(updatedArtwork);
  } catch (error) {
    console.error("Update Artwork Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// 4.5. THE PROFILE ROUTE (Fetches User & Artworks)
// ==========================================
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const artworks = await Artwork.find({ 
      uploadedBy: req.params.userId, 
      status: "published" 
    });
    res.status(200).json({ user, artworks });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch profile." });
  }
});

// ==========================================
// 5. THE POST ROUTE (Uploads the art)
// ==========================================
router.post("/", verifyToken, upload.single("artworkImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    const userId = req.user.id || req.user._id; 
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found in database." });
    }

    const artistName = currentUser.username || currentUser.name || "Unknown Artist";

    const newArtwork = await Artwork.create({
      title: req.body.title,
      medium: req.body.medium,
      description: req.body.description,
      tags: req.body.tags,
      image: `/Artworks/${req.file.filename}`, 
      artistName: artistName,  
      uploadedBy: currentUser._id ,
      status: "pending"
    });

    res.status(201).json(newArtwork);
  } catch (error) {
    console.error("Upload Route Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
