require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbconnect = require("./config/dbconnect.js");
const authroutes = require("./routes/authroutes.js");
const userroutes = require("./routes/userroutes.js");

const app = express();

// --- Allowed Frontend Origins ---
// --- CORS Middleware (Manual to fix Vercel issue) ---
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://awkumtech.awkum.edu.pk",
    "https://www.awkumtech.awkum.edu.pk",
    "http://localhost:5173",
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // ✅ Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
 // <-- Handles all preflight requests globally

// --- Body Parser ---
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- Health Check ---
app.get("/", (req, res) => {
  res.status(200).json({
    message: "AWKUM Tech API is live 🚀",
    allowedOrigins,
  });
});

// --- Routes ---
app.use("/api/auth", authroutes);
app.use("/api/user", userroutes);

// --- Error Handler ---


// --- Server Startup Function ---
const startServer = async () => {
  try {
    await dbconnect();
    const PORT = process.env.PORT || 8001;
    app.listen(PORT, () => {
      console.log("===================================");
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Allowed Origins: ${allowedOrigins.join(", ")}`);
      console.log("===================================");
    });
  } catch (error) {
    console.error("🚨 Database connection failed!");
    console.error(error);
    process.exit(1);
  }
};

startServer();

// ✅ Export for Vercel serverless compatibility
module.exports = app;
