require("dotenv").config();
const express = require("express");
const dbconnect = require("./config/dbconnect.js");
const authroutes = require("./routes/authroutes.js");
const userroutes = require("./routes/userroutes");

const app = express();

// ✅ Define allowed origins
const allowedOrigins = [
  "https://awkumtech.awkum.edu.pk",
  "https://www.awkumtech.awkum.edu.pk",
  "http://localhost:5173"
];

// ✅ CORS Middleware (handles preflight + real requests)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("Incoming Origin:", origin);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // Optional: uncomment this during debugging to confirm CORS works
    // res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // ✅ Always respond to OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// ✅ Parse incoming JSON and URL-encoded data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Routes
app.use("/api/auth", authroutes);
app.use("/api/user", userroutes);

// ✅ Start the server
const startServer = async () => {
  try {
    await dbconnect();
    const PORT = process.env.PORT || 8001;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to connect to DB:", error);
    process.exit(1);
  }
};

startServer();
