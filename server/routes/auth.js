const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/auth");

const router = express.Router();

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "Admin") {
        return res.status(403).json({ message: "Admin access required." });
    }
    next();
};

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
        console.error(err);
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
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/me", protect, async (req, res) => {
    res.status(200).json(req.user);
})

// GET all users
router.get("/", protect, async (req, res) => {
    try {
        const users = await User.find({}); // get all users
        const count = await User.countDocuments({}); // count total
        res.status(200).json({ users, total: count });
    } catch (err) {
        console.error(err);
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

        if (typeof name === "string" && name.trim()) {
            user.name = name.trim();
        }

        if (typeof email === "string" && email.trim()) {
            user.email = email.trim();
        }

        if (typeof role === "string" && role.trim()) {
            user.role = role.trim();
        }

        if (typeof password === "string" && password.trim()) {
            user.password = password.trim();
        }

        await user.save();

        res.status(200).json({
            message: "User request updated successfully",
            user,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Server error updating user" });
    }
});

// PUT route to update a user's status
// Make sure you import your User model at the top if it isn't already!
// const User = require('../models/User');

// PUT route to update a user's status
router.put('/:id/status', protect, requireAdmin, async (req, res) => {
    try {
        // 1. Force the incoming string to lowercase so Mongoose accepts it!
        const status = req.body.status.toLowerCase(); 
        
        // 2. Security check using lowercase
        const validStatuses = ['pending', 'active', 'suspended'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        // 3. Find the user in the database
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 4. Prevent the admin from suspending themselves
        if (user.role === 'Admin' && status === 'suspended') {
            return res.status(403).json({ message: "Cannot suspend an Admin account" });
        }

        // 5. Update and save (now using the safe lowercase string)
        user.status = status;
        await user.save();

        res.json({ message: `User status updated to ${status}`, user });
        
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ message: "Server error updating status" });
    }
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

module.exports = router;
