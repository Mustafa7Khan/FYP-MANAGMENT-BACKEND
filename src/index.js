require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbconnect = require("./config/dbconnect.js");
const authroutes = require("./routes/authroutes.js");
const userroutes = require("./routes/userroutes.js");

// --- Create the Express app instance ---
const app = express();

// --- Allowed Origins ---
const allowedOrigins = [
  "https://awkumtech.awkum.edu.pk",
  "https://www.awkumtech.awkum.edu.pk",
  "http://localhost:5173",
];

// --- CORS Configuration ---
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow if origin is in list or undefined (like server calls)
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// --- Body Parsers ---
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- Health Check Route ---
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "AWKUM Tech API is running smoothly 🚀",
    environment: process.env.NODE_ENV || "development",
  });
});

// --- Routes ---
app.use("/api/auth", authroutes);
app.use("/api/user", userroutes);

// --- Centralized Error Handler ---
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// --- Start the Server Function ---
const startServer = async () => {
  try {
    // 1. Connect to the Database
    await dbconnect();

    // 2. Start Server
    const PORT = process.env.PORT || 8001;
    app.listen(PORT, () => {
      console.log("====================================");
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`✅ Allowed Origins: ${allowedOrigins.join(", ")}`);
      console.log("====================================");
    });

  } catch (error) {
    console.error("🚨 CRITICAL: Database connection failed. Server not started.");
    console.error(error);
    process.exit(1);
  }
};

// --- Execute Startup Function ---
startServer();
