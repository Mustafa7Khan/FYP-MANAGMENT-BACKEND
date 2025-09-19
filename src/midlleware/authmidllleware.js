const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // ✅ Correctly extract token

    console.log("Received Token:", token); // 🔍 Debug: Print token in console
    console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ Verify token
        req.user = decoded;
        console.log("Decoded User:", req.user); // 🔍 Debug: Print decoded user
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};


module.exports = verifyToken;
