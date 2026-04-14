const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/auth");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");

const router = express.Router();

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Admin access required." });
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
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const userRole = role || 'Student';
        const userStatus = status || 'pending';
        const user = await User.create({ name, email, password, role: userRole, status: userStatus });

        await Notification.create({
            recipient: user._id,
            type: 'account_created',
            message: "Your account has been created and is currently pending approval.",
        });

        const token = generateToken(user._id);
        res.status(201).json({ 
            message: "User registered successfully", 
            id: user._id,
            name: user.name, 
            email: user.email, 
            role: user.role,
            token,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
})

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
            token,
        });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/me", protect, async (req, res) => {
    res.status(200).json(req.user);
})

router.get("/saved", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
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
        const user = await User.findById(req.user._id);

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
router.get("/", protect, async (req, res) => {
    try {
        const users = await User.find({}); // get all users
        const count = await User.countDocuments({}); // count total
        res.status(200).json({ users, total: count });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/:id", protect, requireAdmin, async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
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
            if (user.role !== role.trim()) {
                changedFields.push({ field: "role", label: prettifyFieldName("role"), newValue: role.trim() });
            }
            user.role = role.trim();
        }

        if (typeof password === "string" && password.trim()) {
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

// PUT route to update a user's status
router.put('/:id/status', protect, requireAdmin, async (req, res) => {
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

        if (user.role === 'Admin' && status === 'suspended') {
            return res.status(403).json({ message: "Cannot suspend an Admin account" });
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

// Toggle user auto-approve uploads
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

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

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

module.exports = router;
