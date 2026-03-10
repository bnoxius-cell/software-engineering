const express = require("express");
const model = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await model.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await model.create({ username, email, password, role });
        response.status(201).json({ 
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