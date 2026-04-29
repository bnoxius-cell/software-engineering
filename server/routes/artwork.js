const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Artwork = require("../models/Artwork");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");
const ffmpeg = require('fluent-ffmpeg');
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

const artworkAndThumbnailUpload = upload.fields([
  { name: 'artworkImage', maxCount: 1 },
  { name: 'thumbnailImage', maxCount: 1 }
]);

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
      .populate("uploadedBy", "name username avatar")
      .lean();
    res.status(200).json(artworks.map(serializeArtwork));
  } catch (error) {
    console.error("Fetch artworks error:", error);
    res.status(500).json({ message: "Failed to fetch artworks", error: error.message });
  }
});

// ADMIN pending artworks
router.get("/admin/pending", protect, requireAdmin, async (req, res) => {
  try {
    const artworks = await Artwork.find({ status: "pending" })
      .populate("uploadedBy", "name username avatar")
      .lean();
    res.status(200).json(artworks.map(serializeArtwork));
  } catch (error) {
    console.error("Fetch pending artworks error:", error);
    res.status(500).json({ message: "Failed to fetch pending artworks", error: error.message });
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
    console.error("Fetch interactions error:", error);
    res.status(500).json({ message: "Failed to fetch interactions", error: error.message });
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
    console.error("Update artwork status error:", error);
    res.status(500).json({ message: "Failed to update artwork status", error: error.message });
  }
});

// All artworks for admin
router.get("/all", protect, async (req, res) => {
  try {
    const artworks = await Artwork.find({})
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name username avatar")
      .lean();
    res.status(200).json(artworks.map(serializeArtwork));
  } catch (error) {
    console.error("Fetch all artworks error:", error);
    res.status(500).json({ message: "Failed to fetch all artworks", error: error.message });
  }
});

// Update artwork
router.put("/:id", protect, requireAdmin, artworkAndThumbnailUpload, async (req, res) => {
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

    if (req.files && req.files.artworkImage) {
      updateData.image = `/Artworks/${req.files.artworkImage[0].filename}`;
      updateData.mediaType = inferMediaType(req.files.artworkImage[0]);
    }

    if (req.files && req.files.thumbnailImage) {
      updateData.thumbnail = `/Artworks/${req.files.thumbnailImage[0].filename}`;
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
    console.error("Update artwork error:", error);
    res.status(500).json({ message: "Failed to update artwork", error: error.message });
  }
});

// Profile artworks
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const artworks = await Artwork.find({
      uploadedBy: req.params.userId, 
      status: "published" 
    }).populate("uploadedBy", "name username avatar")
      .lean();
    const userWithCounts = {
      ...user,
      followingCount: user.following.length,
      followerCount: user.followers.length
    };
    res.status(200).json({ user: userWithCounts, artworks: artworks.map(serializeArtwork) });
  } catch (error) {
    console.error("Fetch profile artworks error:", error);
    res.status(500).json({ message: "Failed to fetch profile artworks", error: error.message });
  }
});

router.post("/:id/like", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { liked } = req.body;
    const artwork = await Artwork.findById(req.params.id);

    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found." });
    }

    if (liked) {
      await Artwork.findByIdAndUpdate(req.params.id, { $addToSet: { likedBy: userId } });
      await User.findByIdAndUpdate(userId, { $addToSet: { likedArtworks: req.params.id } });
    } else {
      await Artwork.findByIdAndUpdate(req.params.id, { $pull: { likedBy: userId } });
      await User.findByIdAndUpdate(userId, { $pull: { likedArtworks: req.params.id } });
    }

    // Recalculate likes safely
    const updatedArtwork = await Artwork.findById(req.params.id);
    updatedArtwork.likes = updatedArtwork.likedBy ? updatedArtwork.likedBy.length : 0;
    await updatedArtwork.save();

    res.status(200).json({ liked: !!liked, likes: updatedArtwork.likes });
  } catch (error) {
    console.error("Like/unlike error:", error);
    res.status(500).json({ message: "Failed to update like", error: error.message });
  }
});

// Get comments for a specific artwork
router.get("/:id/comments", async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate("comments.user", "name username avatar");
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found." });
    }
    // Sort comments newest first to match frontend expectations
    const sortedComments = artwork.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(sortedComments);
  } catch (error) {
    console.error("Fetch comments error:", error);
    res.status(500).json({ message: "Failed to fetch comments", error: error.message });
  }
});

// Add a comment
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id || req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required." });
    }

    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found." });
    }

    const newComment = {
      user: userId,
      content: content.trim(),
      createdAt: new Date()
    };

    artwork.comments = artwork.comments || [];
    artwork.comments.push(newComment);
    await artwork.save();

    const populatedArtwork = await artwork.populate("comments.user", "name username avatar");
    res.status(201).json(populatedArtwork.comments[populatedArtwork.comments.length - 1]);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Failed to add comment", error: error.message });
  }
});

// Get liked comments for a specific artwork
router.get("/:id/comments/likes", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: "Artwork not found." });

    const likedCommentIds = (artwork.comments || [])
      .filter(comment => comment.likedBy && comment.likedBy.some(id => id && id.toString() === userId.toString()))
      .map(comment => comment._id);

    res.status(200).json(likedCommentIds);
  } catch (error) {
    console.error("Fetch comment likes error:", error);
    res.status(500).json({ message: "Failed to fetch comment likes" });
  }
});

// Like/Unlike a comment
router.post("/:id/comments/:commentId/like", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) return res.status(404).json({ message: "Artwork not found" });

    const comment = artwork.comments.find(c => c._id.toString() === req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.likedBy = comment.likedBy || [];
    const alreadyLiked = comment.likedBy.some(id => id && id.toString() === userId.toString());

    if (!alreadyLiked) {
      comment.likedBy.push(userId);
    } else {
      comment.likedBy = comment.likedBy.filter(id => id && id.toString() !== userId.toString());
    }
    comment.likes = comment.likedBy.length;
    
    artwork.markModified('comments');
    await artwork.save();

    res.status(200).json({ liked: !alreadyLiked, likes: comment.likes });
  } catch (error) {
    console.error("Comment like error:", error);
    res.status(500).json({ message: "Failed to update comment like" });
  }
});

// POST upload
router.post("/", protect, artworkAndThumbnailUpload, async (req, res) => {
  try {
    if (!req.files || !req.files.artworkImage) {
      return res.status(400).json({ message: "No media file uploaded." });
    }
    
    const artworkFile = req.files.artworkImage[0];
    const thumbnailFile = req.files.thumbnailImage ? req.files.thumbnailImage[0] : null;

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
    if (artworkFile.size > maxSizeBytes) {
      fs.unlinkSync(artworkFile.path);
      if (thumbnailFile?.path && fs.existsSync(thumbnailFile.path)) {
        fs.unlinkSync(thumbnailFile.path);
      }
      return res.status(400).json({ message: `File exceeds maximum upload size of ${maxSizeMB}MB.` });
    }

    const newArtworkData = {
      title: req.body.title,
      medium: req.body.medium,
      description: req.body.description,
      tags: req.body.tags,
      mediaType: inferMediaType(artworkFile),
      image: `/Artworks/${artworkFile.filename}`,
      artistName: artistName,
      uploadedBy: currentUser._id,
      status: artworkStatus
    };

    if (newArtworkData.mediaType === 'video') {
      if (thumbnailFile) {
        // Use user-provided thumbnail
        newArtworkData.thumbnail = `/Artworks/${thumbnailFile.filename}`;
      } else {
        // Auto-generate thumbnail if none is provided
        const thumbnailFilename = `${path.parse(artworkFile.filename).name}.png`;
        const thumbnailPath = path.join(uploadDir, thumbnailFilename);

        try {
          await new Promise((resolve, reject) => {
            ffmpeg(artworkFile.path)
              .on('end', resolve)
              .on('error', (err) => {
                console.error('FFMPEG thumbnail generation error:', err.message);
                resolve(); // Continue without a thumbnail if generation fails
              })
              .screenshots({
                timestamps: ['00:00:01.000'],
                filename: thumbnailFilename,
                folder: uploadDir,
                size: '640x?'
              });
          });

          if (fs.existsSync(thumbnailPath)) {
            newArtworkData.thumbnail = `/Artworks/${thumbnailFilename}`;
          }
        } catch (ffmpegError) {
            console.error("An unexpected error occurred during thumbnail generation:", ffmpegError);
        }
      }
    }

    const newArtwork = await Artwork.create(newArtworkData);

    if (autoApprove && currentUser.notifications?.artworkAdded !== false) {
      await Notification.create({
        recipient: currentUser._id,
        type: 'artwork_approved',
        message: `Your artwork "${req.body.title}" has been auto-approved and published!`,
      });
    }

    res.status(201).json(newArtwork);
  } catch (error) {
    console.error("Artwork upload failed:", error);
    res.status(500).json({ message: "Failed to upload artwork", error: error.message });
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
    console.error("Fetch user artworks error:", error);
    res.status(500).json({ message: "Failed to fetch artworks", error: error.message });
  }
});

module.exports = router;
