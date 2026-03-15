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

// ==========================================
// 4. THE MISSING GET ROUTE (Fetches the art)
// ==========================================
router.get("/", async (req, res) => {
  try {
    const artworks = await Artwork.find({});
    res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      uploadedBy: currentUser._id 
    });

    res.status(201).json(newArtwork);
  } catch (error) {
    console.error("Upload Route Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;