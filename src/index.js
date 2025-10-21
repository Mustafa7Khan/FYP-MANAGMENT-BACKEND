require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbconnect = require("./config/dbconnect.js");
const authroutes = require("./routes/authroutes.js");
const userroutes = require("./routes/userroutes.js");

const app = express();

const allowedOrigins = [
  "https://awkumtech.awkum.edu.pk",
  "https://www.awkumtech.awkum.edu.pk",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// ✅ Allow CORS globally and for preflight requests
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "AWKUM Tech API running 🚀" });
});

app.use("/api/auth", authroutes);
app.use("/api/user", userroutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: err.message });
});

const startServer = async () => {
  try {
    await dbconnect();
    const PORT = process.env.PORT || 8001;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("🚨 DB connection failed:", error);
    process.exit(1);
  }
};

startServer();
