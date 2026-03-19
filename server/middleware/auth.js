const User = require("../models/User");
const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Fetch the user
            req.user = await User.findById(decoded.id).select("-password");

            // ===== NEW: CHECK USER STATUS =====
            if (!req.user) {
                 return res.status(401).json({ message: "User no longer exists." });
            }
            if (req.user.status === 'suspended') {
                 return res.status(403).json({ message: "Your account has been suspended. Please contact support." });
            }
            if (req.user.status === 'pending') {
                 return res.status(403).json({ message: "Your account is still pending admin approval." });
            }
            // ==================================

            return next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
}

module.exports = { protect };