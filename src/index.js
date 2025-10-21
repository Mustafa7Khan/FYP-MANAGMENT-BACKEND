require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http");
const dbconnect = require("./config/dbconnect.js");
const authroutes = require("./routes/authroutes.js");
const userroutes = require("./routes/userroutes");

const app = express();

const allowedOrigins = [
  "https://awkumtech.awkum.edu.pk",
  "https://www.awkumtech.awkum.edu.pk",
  "http://localhost:5173",
];

// ✅ CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("Incoming Origin:", origin);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // Uncomment this temporarily for debugging:
    // res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Routes
app.use("/api/auth", authroutes);
app.use("/api/user", userroutes);

// ✅ Database connection
(async () => {
  try {
    await dbconnect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
})();

// ✅ Export handler for Vercel
module.exports = app;
module.exports.handler = serverless(app);
