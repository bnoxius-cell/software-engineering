const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ name, email, password, role });
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

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

module.exports = router;