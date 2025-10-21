require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbconnect = require("./config/dbconnect.js");
const authroutes = require("./routes/authroutes.js");
const userroutes = require("./routes/userroutes.js");

const app = express();

// --- Allowed Frontend Origins ---
const allowedOrigins = [
  "https://awkumtech.awkum.edu.pk",
  "https://www.awkumtech.awkum.edu.pk",
  "http://localhost:5173",
];

// --- CORS Configuration ---
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// ✅ Must be BEFORE routes
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // <-- Handles all preflight requests globally

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
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: err.message });
});

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
