const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Artwork = require("../../server/models/Artwork"); // Adjusted path to your model just in case!

// 1. Climb out of /server/routes/ and go into /public/Artworks
const uploadDir = path.join(__dirname, "../../public/Artworks");

// Auto-create it if it somehow gets deleted
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Multer
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

// GET all artworks
router.get("/", async (req, res) => {
  try {
    const artworks = await Artwork.find({});
    res.status(200).json(artworks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new artwork
// Notice the route is now "/" to match React, and we injected the Multer middleware!
router.post("/", upload.single("artworkImage"), async (req, res) => {
  try {
    // If multer failed to catch the file, stop right here
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded." });
    }

    // Create the Mongoose object manually using the text fields from req.body 
    // and the new filename from req.file
    const newArtwork = await Artwork.create({
      title: req.body.title,
      medium: req.body.medium,
      description: req.body.description,
      tags: req.body.tags,
      // We save the path exactly as your express.static middleware expects it
      image: `/Artworks/${req.file.filename}`, 
    });

    res.status(201).json(newArtwork);
  } catch (error) {
    console.error("Upload Route Error:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;