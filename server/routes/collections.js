const express = require("express");
const Collection = require("../models/Collection");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Create collection
router.post("/", protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Collection name is required" });
    }

    const collection = new Collection({
      name,
      description: description || "",
      user: req.user._id,
      artworks: []
    });

    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's collections
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const collections = await Collection.find({ user: userId }).populate('artworks', 'title image');
    res.status(200).json(collections);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update collection (add/remove artworks)
router.put("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, artworks } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (name !== undefined) collection.name = name;
    if (description !== undefined) collection.description = description;
    if (artworks !== undefined) collection.artworks = artworks;

    await collection.save();
    await collection.populate('artworks', 'title image');
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete collection
router.delete("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findById(id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Collection.findByIdAndDelete(id);
    res.status(200).json({ message: "Collection deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add artwork to collection
router.post("/:id/add", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { artworkId } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!collection.artworks.includes(artworkId)) {
      collection.artworks.push(artworkId);
      await collection.save();
    }

    await collection.populate('artworks', 'title image');
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Remove artwork from collection
router.post("/:id/remove", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { artworkId } = req.body;

    const collection = await Collection.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    collection.artworks = collection.artworks.filter(artwork => artwork.toString() !== artworkId);
    await collection.save();

    await collection.populate('artworks', 'title image');
    res.status(200).json(collection);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;