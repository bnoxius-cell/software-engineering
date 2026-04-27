const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Artwork = require("../models/Artwork");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");
const { protect, requireAdmin } = require("../middleware/auth");

// Set up the upload directory
const uploadDir = path.join(__dirname, "../../public/Artworks");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const inferMediaType = (file) => {
  if (!file?.mimetype) {
    return "image";
  }

  if (file.mimetype.startsWith("video/")) {
    return "video";
  }

  return "image";
};

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype?.startsWith("image/") ||
    file.mimetype?.startsWith("video/")
  ) {
    return cb(null, true);
  }

  return cb(new Error("Only image and video uploads are allowed."));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const prettifyFieldName = (field) =>
  field
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const collectChangedFields = (originalDoc, nextValues) =>
  Object.entries(nextValues)
    .filter(([, value]) => value !== undefined)
    .filter(([key, value]) => {
      const originalValue = originalDoc?.[key] ?? "";
      return String(originalValue) !== String(value);
    })
    .map(([key, value]) => ({
      field: key,
      label: prettifyFieldName(key),
      newValue: value,
    }));

const serializeArtwork = (artwork) => {
  const plainArtwork = artwork.toObject ? artwork.toObject() : artwork;
  const uploader =
    plainArtwork.uploadedBy && typeof plainArtwork.uploadedBy === "object" && !Array.isArray(plainArtwork.uploadedBy)
      ? plainArtwork.uploadedBy
      : null;

  return {
    ...plainArtwork,
    uploadedBy: uploader?._id || plainArtwork.uploadedBy || null,
    artistName:
      plainArtwork.artistName ||
      uploader?.username ||
      uploader?.name ||
      "Unknown Artist",
    artistAvatar: uploader?.avatar || "",
  };
};

// GET artworks
router.get("/", async (req, res) => {
  try {
    const artworks = await Artwork.find({ status: "published" })
      .populate("uploadedBy", "name username avatar");
    res.status(200).json(artworks.map(serializeArtwork));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch artworks" });
  }
});

// ADMIN pending artworks
router.get("/admin/pending", protect, requireAdmin, async (req, res) => {
  try {
    const artworks = await Artwork.find({ status: "pending" })
      .populate("uploadedBy", "name username avatar");
    res.status(200).json(artworks.map(serializeArtwork));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending artworks" });
  }
});

router.get("/interactions", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const currentUser = await User.findById(userId).select("likedArtworks savedArtworks");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      likedArtworkIds: (currentUser.likedArtworks || []).map((id) => id.toString()),
      savedArtworkIds: (currentUser.savedArtworks || []).map((id) => id.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interactions" });
  }
});

// Update artwork status
router.put("/:id/status", protect, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedArtwork = await Artwork.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (status === 'published' && updatedArtwork) {
      // Check user's notification preferences
      const user = await User.findById(updatedArtwork.uploadedBy);
      if (user.notifications?.artworkAdded !== false) { // Default to true if not set
        await Notification.create({
          recipient: updatedArtwork.uploadedBy,
          type: 'artwork_approved',
          message: `Your artwork "${updatedArtwork.title}" has been approved and published!`,
        });
      }
    }

    res.status(200).json(updatedArtwork);
  } catch (error) {
    res.status(500).json({ message: "Failed to update artwork status" });
  }
});

// All artworks for admin
router.get("/all", protect, async (req, res) => {
  try {
    const artworks = await Artwork.find({})
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name username avatar");
    res.status(200).json(artworks.map(serializeArtwork));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all artworks" });
  }
});

// Update artwork
router.put("/:id", protect, requireAdmin, upload.single("artworkImage"), async (req, res) => {
  try {
    const existingArtwork = await Artwork.findById(req.params.id);

    if (!existingArtwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    const updateData = {
      title: req.body.title,
      medium: req.body.medium,
      status: req.body.status,
      tags: req.body.tags,
      artistName: req.body.artistName,
      description: req.body.description
    };

    if (req.file) {
      updateData.image = `/Artworks/${req.file.filename}`;
      updateData.mediaType = inferMediaType(req.file);
    }

    const changedFields = collectChangedFields(existingArtwork, updateData);

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    if (changedFields.length > 0) {
      await Notification.create({
        recipient: updatedArtwork.uploadedBy,
        type: 'info_modified',
        message: `Admin updated your artwork details for "${updatedArtwork.title}".`,
        details: { updatedFields: changedFields }
      });
    }

    res.status(200).json(updatedArtwork);
  } catch (error) {
    res.status(500).json({ message: "Failed to update artwork" });
  }
});

// Profile artworks
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const artworks = await Artwork.find({
      uploadedBy: req.params.userId, 
      status: "published" 
    }).populate("uploadedBy", "name username avatar");
    const userWithCounts = {
      ...user.toObject(),
      followingCount: user.following.length,
      followerCount: user.followers.length
    };
    res.status(200).json({ user: userWithCounts, artworks: artworks.map(serializeArtwork) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile artworks" });
  }
});

router.post("/:id/like", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { liked } = req.body;
    const artwork = await Artwork.findById(req.params.id);
    const currentUser = await User.findById(userId);

    if (!artwork || !currentUser) {
      return res.status(404).json({ message: "Artwork or user not found." });
    }

    artwork.likedBy = artwork.likedBy || [];
    currentUser.likedArtworks = currentUser.likedArtworks || [];

    const alreadyLiked = artwork.likedBy.some((id) => id.toString() === userId.toString());

    if (liked && !alreadyLiked) {
      artwork.likedBy.push(userId);
      artwork.likes = artwork.likedBy.length;
      currentUser.likedArtworks.addToSet(artwork._id);
    }

    if (!liked && alreadyLiked) {
      artwork.likedBy = artwork.likedBy.filter((id) => id.toString() !== userId.toString());
      artwork.likes = artwork.likedBy.length;
      currentUser.likedArtworks = currentUser.likedArtworks.filter((id) => id.toString() !== artwork._id.toString());
    }

    await artwork.save();
    await currentUser.save();

    res.status(200).json({ liked: !!liked, likes: artwork.likes });
  } catch (error) {
    res.status(500).json({ message: "Failed to update like" });
  }
});

// POST upload
router.post("/", protect, upload.single("artworkImage"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No media file uploaded." });
    }

    const userId = req.user.id || req.user._id; 
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found in database." });
    }

    const artistName = currentUser.username || currentUser.name || "Unknown Artist";

    const settings = await Settings.findOne();
    const globalAutoApproveStudents = settings ? settings.autoApproveStudents : false;
    const autoApprove = currentUser.role.toLowerCase() !== 'student' || globalAutoApproveStudents;
    const artworkStatus = autoApprove ? 'published' : 'pending';

    // Enforce maxUploadSize from settings
    const maxSizeMB = settings ? settings.maxUploadSize : 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (req.file.size > maxSizeBytes) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: `File exceeds maximum upload size of ${maxSizeMB}MB.` });
    }

    const newArtwork = await Artwork.create({
      title: req.body.title,
      medium: req.body.medium,
      description: req.body.description,
      tags: req.body.tags,
      mediaType: inferMediaType(req.file),
      image: `/Artworks/${req.file.filename}`, 
      artistName: artistName,  
      uploadedBy: currentUser._id ,
      status: artworkStatus
    });

    if (autoApprove && currentUser.notifications?.artworkAdded !== false) {
      await Notification.create({
        recipient: currentUser._id,
        type: 'artwork_approved',
        message: `Your artwork "${req.body.title}" has been auto-approved and published!`,
      });
    }

    res.status(201).json(newArtwork);
  } catch (error) {
    res.status(500).json({ message: "Failed to upload artwork" });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File is too large. Maximum size is 100MB." });
    }

    return res.status(400).json({ message: error.message });
  }

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
});

// Get user's own artworks
router.get("/user/me", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const artworks = await Artwork.find({ uploadedBy: userId }).sort({ createdAt: -1 });
    res.status(200).json(artworks.map(serializeArtwork));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch artworks" });
  }
});

module.exports = router;
