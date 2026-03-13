const express = require("express");
const router = express.Router();
const Artwork = require("../models/Uploads");

router.post("/create", async (req, res) => {
  try {
    const newArtwork = await Artwork.create(req.body);
    res.status(201).json(newArtwork);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;