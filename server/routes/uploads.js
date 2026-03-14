const express = require("express");
const router = express.Router();
const Artwork = require("../models/Uploads");

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
router.post("/create", async (req, res) => {
  try {
    const newArtwork = await Artwork.create(req.body);
    res.status(201).json(newArtwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;