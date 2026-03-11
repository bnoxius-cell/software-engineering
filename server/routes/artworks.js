const express = require("express");
const Artwork = require("../models/Artwork");

const router = express.Router();

// Get all artworks
router.get("/", async (req, res) => {
    try {
        const artworks = await Artwork.find().sort({ createdAt: -1 });
        res.status(200).json(artworks);
    } catch (err) {
        console.error("Error fetching artworks:", err);
        res.status(500).json({ message: "Failed to fetch artworks" });
    }
});

// Get featured artworks
router.get("/featured", async (req, res) => {
    try {
        const artworks = await Artwork.find({ featured: true }).sort({ createdAt: -1 });
        res.status(200).json(artworks);
    } catch (err) {
        console.error("Error fetching featured artworks:", err);
        res.status(500).json({ message: "Failed to fetch featured artworks" });
    }
});

// Get single artwork
router.get("/:id", async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.id);
        if (!artwork) {
            return res.status(404).json({ message: "Artwork not found" });
        }
        res.status(200).json(artwork);
    } catch (err) {
        console.error("Error fetching artwork:", err);
        res.status(500).json({ message: "Failed to fetch artwork" });
    }
});

// Create new artwork (admin only)
router.post("/", async (req, res) => {
    try {
        const { title, artist, description, imageUrl, medium, genre, year, featured } = req.body;

        if (!title || !artist || !description || !imageUrl) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const artwork = await Artwork.create({
            title,
            artist,
            description,
            imageUrl,
            medium,
            genre,
            year,
            featured
        });

        res.status(201).json(artwork);
    } catch (err) {
        console.error("Error creating artwork:", err);
        res.status(500).json({ message: "Failed to create artwork" });
    }
});

module.exports = router;
