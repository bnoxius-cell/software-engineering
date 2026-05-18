const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Artwork = require("../models/Artwork");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");
const Collection = require("../models/Collection");
const ffmpeg = require('fluent-ffmpeg');
const { protect, requireAdmin, requireStaff } = require("../middleware/auth");

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

// ========== UPDATED AUTHORIZE MIDDLEWARE (faculty support) ==========
const authorizeArtworkMutation = async (req, res, next) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate("uploadedBy");
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    const isAdmin = req.user?.role === "Admin";
    const isOwner = artwork.uploadedBy?._id.toString() === req.user._id.toString();
    const isFaculty = req.user?.role === "Faculty";

    const isAdminAuthor = artwork.uploadedBy?.role === "Admin";
    const canModifyAsFaculty = isFaculty && !isAdminAuthor;

    if (!isAdmin && !isOwner && !canModifyAsFaculty) {
      return res.status(403).json({ message: "You do not have permission to modify this artwork." });
    }

    req.artwork = artwork;
    req.isArtworkAdmin = isAdmin;
    req.isArtworkOwner = isOwner;
    next();
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).json({ message: "Failed to authorize artwork action" });
  }
};

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

// GET artworks (public)
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
router.get("/admin/pending", protect, requireStaff, async (req, res) => {
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
    const currentUser = await User.findById(userId).select("likedArtworks savedArtworks following");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      likedArtworkIds: (currentUser.likedArtworks || []).map((id) => id.toString()),
      savedArtworkIds: (currentUser.savedArtworks || []).map((id) => id.toString()),
      followingUserIds: (currentUser.following || []).map((id) => id.toString()),
      currentUserId: currentUser._id.toString(),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch interactions" });
  }
});

// ========== UPDATED STATUS ROUTE (with notifications for remove/restore) ==========
router.put("/:id/status", protect, async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate("uploadedBy");
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    const isAdmin = req.user?.role === "Admin";
    const isOwner = artwork.uploadedBy?._id.toString() === req.user._id.toString();
    const isFaculty = req.user?.role === "Faculty";

    const isAdminAuthor = artwork.uploadedBy?.role === "Admin";
    const canModifyAsFaculty = isFaculty && !isAdminAuthor;

    if (!isAdmin && !isOwner && !canModifyAsFaculty) {
      return res.status(403).json({ message: "You do not have permission to change this artwork's status." });
    }

    const oldStatus = artwork.status;
    const { status } = req.body;
    const updatedArtwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // Send notification for status changes if actor is not the owner
    if (!isOwner && updatedArtwork) {
      const actionerName = req.user.name || req.user.username || "An administrator";
      let notificationMessage = "";

      if (status === 'published' && oldStatus !== 'published') {
        notificationMessage = `${actionerName} has ${oldStatus === 'rejected' || oldStatus === 'archived' ? 'restored' : 'approved'} your artwork "${updatedArtwork.title}".`;
      } else if (status === 'rejected') {
        notificationMessage = `${actionerName} has removed your artwork "${updatedArtwork.title}". It is now hidden from public view.`;
      } else if (status === 'archived') {
        notificationMessage = `${actionerName} has archived your artwork "${updatedArtwork.title}".`;
      }

      if (notificationMessage) {
        const user = await User.findById(updatedArtwork.uploadedBy);
        if (user.notifications?.artworkAdded !== false) {
          await Notification.create({
            recipient: updatedArtwork.uploadedBy,
            type: 'info_modified',
            message: notificationMessage,
            details: { oldStatus, newStatus: status }
          });
        }
      }
    }

    res.status(200).json(updatedArtwork);
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ message: "Failed to update artwork status" });
  }
});

// All artworks for staff (admin & faculty)
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

// ========== UPDATED EDIT ROUTE (with notification for non-owner edits) ==========
router.put("/:id", protect, authorizeArtworkMutation, artworkAndThumbnailUpload, async (req, res) => {
  try {
    const existingArtwork = req.artwork;
    const isAdmin = req.isArtworkAdmin;
    const isOwner = req.isArtworkOwner;
    const updateData = {
      title: req.body.title,
      medium: req.body.medium,
      tags: req.body.tags,
      description: req.body.description
    };

    if (isAdmin) {
      updateData.status = req.body.status;
      updateData.artistName = req.body.artistName;
    }

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

    // Send notification if the editor is NOT the owner (admin or faculty)
    if (!isOwner && changedFields.length > 0) {
      const actionerName = req.user.name || req.user.username || "An administrator";
      const fieldNames = changedFields.map(f => f.label).join(", ");
      const message = `${actionerName} updated your artwork "${updatedArtwork.title}" (fields: ${fieldNames}).`;

      const user = await User.findById(updatedArtwork.uploadedBy);
      if (user.notifications?.artworkAdded !== false) {
        await Notification.create({
          recipient: updatedArtwork.uploadedBy,
          type: 'info_modified',
          message: message,
          details: { updatedFields: changedFields }
        });
      }
    }

    res.status(200).json(serializeArtwork(updatedArtwork));
  } catch (error) {
    console.error("Edit error:", error);
    res.status(500).json({ message: "Failed to update artwork" });
  }
});

// Profile artworks - FIXED to count only active users in following/followers
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

    // Count only active users in following and followers arrays
    const followingCount = await User.countDocuments({
      _id: { $in: user.following || [] },
      status: 'active'
    });
    const followerCount = await User.countDocuments({
      _id: { $in: user.followers || [] },
      status: 'active'
    });

    const userWithCounts = {
      ...user.toObject(),
      followingCount,
      followerCount
    };
    res.status(200).json({ user: userWithCounts, artworks: artworks.map(serializeArtwork) });
  } catch (error) {
    console.error("Profile fetch error:", error);
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

// POST upload (unchanged)
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

    // ========== NEW: Use global auto-approve for artworks ==========
    const settings = await Settings.findOne();
    const autoApproveArtworksGlobal = settings ? settings.autoApproveArtworks : false;
    const artworkStatus = autoApproveArtworksGlobal ? 'published' : 'pending';
    // ================================================================

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
        newArtworkData.thumbnail = `/Artworks/${thumbnailFile.filename}`;
      } else {
        const thumbnailFilename = `${path.parse(artworkFile.filename).name}.png`;
        const thumbnailPath = path.join(uploadDir, thumbnailFilename);

        try {
          await new Promise((resolve, reject) => {
            ffmpeg(artworkFile.path)
              .on('end', resolve)
              .on('error', (err) => {
                console.error('FFMPEG thumbnail generation error:', err.message);
                resolve();
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

    if (autoApproveArtworksGlobal && currentUser.notifications?.artworkAdded !== false) {
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
    res.status(500).json({ message: "Failed to fetch artworks" });
  }
});

// Delete artwork – uses the updated authorize middleware
router.delete("/:id", protect, authorizeArtworkMutation, async (req, res) => {
  try {
    const artwork = req.artwork;

    await Artwork.findByIdAndDelete(req.params.id);
    await Collection.updateMany(
      { artworks: artwork._id },
      { $pull: { artworks: artwork._id } }
    );
    await User.updateMany(
      { $or: [{ savedArtworks: artwork._id }, { likedArtworks: artwork._id }] },
      { $pull: { savedArtworks: artwork._id, likedArtworks: artwork._id } }
    );

    res.status(200).json({ message: "Artwork deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete artwork" });
  }
});

module.exports = router;