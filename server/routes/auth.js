const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({ username, email, password, role });
        res.status(201).json({ 
            message: "User registered successfully", 
            id: user._id,
            username: user.username, 
            email: user.email, 
            role: user.role
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
        const userExists = await model.findOne({ email });
        if (!userExists || !(await userExists.matchPassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" }); 
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

/*router.post("/me", async (req, res) => {
    res.status(200).json({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
    });
})*/

export default router;