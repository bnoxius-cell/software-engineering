const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect, requireAdmin } = require("../middleware/auth");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Set up avatar upload directory
const avatarDir = path.join(__dirname, "../../public/avatars");
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// Configure Multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Only image files are allowed"));
  }
});

const normalizeRole = (role) => (typeof role === "string" ? role.trim().toLowerCase() : "");

const requireStaff = (req, res, next) => {
    if (!req.user || !["Admin", "Faculty"].includes(req.user.role)) {
        return res.status(403).json({ message: "Admin or faculty access required." });
    }
    next();
};

const prettifyFieldName = (field) =>
    field
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (char) => char.toUpperCase());

// Register
router.post("/register", async (req, res) => {
    const { name, email, password, role, status } = req.body;

    try {
        const settings = await Settings.findOne();
        if (settings && settings.allowRegistration === false) {
            return res.status(403).json({ message: "New registrations are currently disabled." });
        }

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const requestedRole = normalizeRole(role);
        if (requestedRole === "admin") {
            return res.status(403).json({ message: "Only admins can create admin accounts." });
        }

        const userRole =
            requestedRole === "faculty"
                ? "Faculty"
                : requestedRole === "student"
                    ? "Student"
                    : "Student";

        const autoApproveStudents = settings ? settings.autoApproveStudents : false;
        let userStatus;
        if (userRole === "Student") {
            userStatus = autoApproveStudents ? "active" : "pending";
        } else {
            userStatus = "pending";
        }

        const user = await User.create({
            name,
            email,
            password,
            role: userRole,
            status: userStatus
        });

        await Notification.create({
            recipient: user._id,
            type: 'account_created',
            message: userStatus === "active"
                ? "Your account has been automatically approved. Welcome!"
                : "Your account has been created and is currently pending approval.",
        });

        const token = generateToken(user._id);
        res.status(201).json({
            message: userStatus === "active"
                ? "User registered and automatically approved."
                : "User registered successfully. Awaiting admin approval.",
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/register/admin", protect, requireAdmin, async (req, res) => {
    const { name, email, password, status } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: "Admin",
            status: status || "active",
        });

        await Notification.create({
            recipient: user._id,
            type: "account_created",
            message: "An administrator account has been created for you.",
        });

        res.status(201).json({
            message: "Admin account created successfully",
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const userExists = await User.findOne({ email });
        if (!userExists || !(await userExists.matchPassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" }); 
        }
        const token = generateToken(userExists._id);
        res.status(200).json({ 
            message: "User logged in successfully", 
            id: userExists._id,
            name: userExists.name, 
            email: userExists.email, 
            role: userExists.role,
            avatar: userExists.avatar || "",
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/me", protect, async (req, res) => {
    res.status(200).json(req.user);
});

router.get("/saved", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id || req.user.id)
            .populate({
                path: "savedArtworks",
                match: { status: "published" },
            })
            .select("savedArtworks");
        res.status(200).json({
            savedArtworks: (user?.savedArtworks || []).filter(Boolean),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/saved", protect, async (req, res) => {
    try {
        const { artworkId, saved } = req.body;
        const user = await User.findById(req.user._id || req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.savedArtworks = user.savedArtworks || [];
        const alreadySaved = user.savedArtworks.some((id) => id.toString() === artworkId);
        if (saved && !alreadySaved) {
            user.savedArtworks.push(artworkId);
        }
        if (!saved && alreadySaved) {
            user.savedArtworks = user.savedArtworks.filter((id) => id.toString() !== artworkId);
        }
        await user.save();
        res.status(200).json({
            saved: !!saved,
            savedArtworkIds: user.savedArtworks.map((id) => id.toString()),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// GET all users
router.get("/", protect, requireStaff, async (req, res) => {
    try {
        const users = await User.find({});
        const count = await User.countDocuments({});
        res.status(200).json({ users, total: count });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Global auto-approve settings for students
router.get('/settings/autoapprove', protect, requireAdmin, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json({ 
      autoApproveStudents: settings ? settings.autoApproveStudents : false 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/settings/autoapprove', protect, requireAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    const newValue = !(settings ? settings.autoApproveStudents : false);
    if (settings) {
      settings.autoApproveStudents = newValue;
      await settings.save();
    } else {
      settings = await Settings.create({ autoApproveStudents: newValue });
    }
    res.json({ 
      message: `Global student auto-approve ${newValue ? 'ON' : 'OFF'}`,
      autoApproveStudents: newValue 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Follow/Unfollow user
router.post('/follow/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id || req.user.id;
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }
    const userToFollow = await User.findById(userId).select('followers');
    const currentUser = await User.findById(currentUserId).select('name following');
    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    currentUser.following = currentUser.following || [];
    userToFollow.followers = userToFollow.followers || [];
    const isFollowing = currentUser.following.some(id => id.toString() === userId);
    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId.toString());
    } else {
      if (!currentUser.following.some(id => id.toString() === userId)) {
        currentUser.following.push(userId);
      }
      if (!userToFollow.followers.some(id => id.toString() === currentUserId.toString())) {
        userToFollow.followers.push(currentUserId);
      }
    }
    await currentUser.save();
    await userToFollow.save();
    res.status(200).json({
      following: !isFollowing,
      followingCount: currentUser.following.length,
      followerCount: userToFollow.followers.length
    });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get following list
router.get('/following/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const currentUserId = req.user._id || req.user.id;
    if (user.privacy?.hideFollowing && currentUserId.toString() !== userId) {
      return res.status(403).json({ message: "Following list is private" });
    }
    const following = await User.findById(userId).populate('following', 'name username avatar bio');
    res.status(200).json({ following: following.following });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get followers list
router.get('/followers/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const currentUserId = req.user._id || req.user.id;
    if (user.privacy?.hideFollowers && currentUserId.toString() !== userId) {
      return res.status(403).json({ message: "Followers list is private" });
    }
    const followers = await User.findById(userId).populate('followers', 'name username avatar bio');
    res.status(200).json({ followers: followers.followers });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update bio
router.put('/bio', protect, async (req, res) => {
  try {
    const { bio } = req.body;
    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      { bio: bio || "" },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ bio: user.bio });
  } catch (error) {
    console.error("Bio save error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update social links
router.put('/socials', protect, async (req, res) => {
  try {
    const { socials } = req.body;
    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        socials: {
          twitter: socials?.twitter || "",
          instagram: socials?.instagram || "",
          website: socials?.website || ""
        }
      },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ socials: user.socials });
  } catch (error) {
    console.error("Social save error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update privacy settings
router.put('/privacy', protect, async (req, res) => {
  try {
    const { privacy } = req.body;
    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        privacy: {
          hideFollowers: Boolean(privacy?.hideFollowers ?? false),
          hideFollowing: Boolean(privacy?.hideFollowing ?? false)
        }
      },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ privacy: user.privacy });
  } catch (error) {
    console.error("Privacy update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update notification preferences
router.put('/notifications', protect, async (req, res) => {
  try {
    const { notifications } = req.body;
    const userId = req.user._id || req.user.id;
    const user = await User.findByIdAndUpdate(
      userId,
      {
        notifications: {
          artworkAdded: notifications?.artworkAdded !== undefined ? notifications.artworkAdded : true
        }
      },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ notifications: user.notifications });
  } catch (error) {
    console.error("Notifications update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Self avatar upload (for the logged-in user)
router.post('/avatar', protect, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.avatar && user.avatar !== "/assets/images/profile_icon.png") {
      const oldAvatarPath = path.join(__dirname, "../../public", user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }
    user.avatar = `/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(userId, { avatar: user.avatar });
    res.status(200).json({ avatar: user.avatar });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update profile (name, bio)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.user._id || req.user.id;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ name: user.name, bio: user.bio });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Change password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Admin/staff: edit user details (name, email, role, password)
router.put("/:id", protect, requireStaff, async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.role === "Admin" && req.user.role !== "Admin") {
            return res.status(403).json({ message: "Only admins can edit admin accounts." });
        }
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: "Email is already in use" });
            }
        }
        const changedFields = [];
        if (typeof name === "string" && name.trim()) {
            if (user.name !== name.trim()) {
                changedFields.push({ field: "name", label: prettifyFieldName("name"), newValue: name.trim() });
            }
            user.name = name.trim();
        }
        if (typeof email === "string" && email.trim()) {
            if (user.email !== email.trim()) {
                changedFields.push({ field: "email", label: prettifyFieldName("email"), newValue: email.trim() });
            }
            user.email = email.trim();
        }
        if (typeof role === "string" && role.trim()) {
            const normalizedRequestedRole = normalizeRole(role);
            const nextRole =
                normalizedRequestedRole === "admin"
                    ? "Admin"
                    : normalizedRequestedRole === "faculty"
                        ? "Faculty"
                        : "Student";
            if (nextRole === "Admin" && req.user.role !== "Admin") {
                return res.status(403).json({ message: "Only admins can assign the admin role." });
            }
            if (user.role === "Admin" && req.user.role !== "Admin") {
                return res.status(403).json({ message: "Only admins can edit admin accounts." });
            }
            if (user.role !== nextRole) {
                changedFields.push({ field: "role", label: prettifyFieldName("role"), newValue: nextRole });
            }
            user.role = nextRole;
        }
        if (typeof password === "string" && password.trim()) {
            if (user.role === "Admin" && req.user.role !== "Admin") {
                return res.status(403).json({ message: "Only admins can edit admin accounts." });
            }
            changedFields.push({ field: "password", label: prettifyFieldName("password"), newValue: "Updated" });
            user.password = password.trim();
        }
        await user.save();
        if (changedFields.length > 0) {
            await Notification.create({
                recipient: user._id,
                type: 'info_modified',
                message: "An administrator has updated your account information.",
                details: { updatedFields: changedFields }
            });
        }
        res.status(200).json({
            message: "User request updated successfully",
            user,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error updating user" });
    }
});

// Update user status (pending/active/suspended)
router.put('/:id/status', protect, requireStaff, async (req, res) => {
    try {
        const status = req.body.status.toLowerCase(); 
        const validStatuses = ['pending', 'active', 'suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.role === 'Admin') {
            return res.status(403).json({ message: "Only admins can update admin account status." });
        }
        user.status = status;
        await user.save();
        if (status === 'active') {
            await Notification.create({
                recipient: user._id,
                type: 'account_approved',
                message: "Welcome! Your account has been approved by the administration.",
            });
        }
        res.json({ message: `User status updated to ${status}`, user });
    } catch (error) {
        res.status(500).json({ message: "Server error updating status" });
    }
});

// Toggle auto-approve uploads for a user
router.put('/:id/autoapprove', protect, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.autoApproveUploads = !user.autoApproveUploads;
        await user.save();
        res.json({ 
            message: `Auto-approve toggled ${user.autoApproveUploads ? 'ON' : 'OFF'}`, 
            autoApproveUploads: user.autoApproveUploads 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Staff-only: update avatar for any user (by ID) – with notification
router.post('/:id/avatar', protect, requireStaff, avatarUpload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const targetUserId = req.params.id;
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Delete old avatar if exists (and not the default placeholder)
        if (targetUser.avatar && targetUser.avatar !== "/assets/images/profile_icon.png") {
            const oldAvatarPath = path.join(__dirname, "../../public", targetUser.avatar);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }
        targetUser.avatar = `/avatars/${req.file.filename}`;
        await targetUser.save();

        // Create notification for the target user (unless admin is updating own avatar)
        if (req.user._id.toString() !== targetUserId.toString()) {
            await Notification.create({
                recipient: targetUser._id,
                type: 'info_modified',
                message: `${req.user.name} updated your profile picture.`,
                details: {
                    updatedFields: [
                        { field: "avatar", label: "Profile Picture", newValue: "Updated" }
                    ]
                }
            });
        }
        res.status(200).json({ avatar: targetUser.avatar });
    } catch (error) {
        console.error("Avatar update for user error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;