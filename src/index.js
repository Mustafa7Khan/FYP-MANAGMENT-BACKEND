require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbconnect = require("./config/dbconnect.js");
const authroutes = require("./routes/authroutes.js");
const userroutes = require("./routes/userroutes");

// Create the Express app instance
const app = express();

const allowedOrigins = [
  "https://awkumtech.awkum.edu.pk",
  "https://www.awkumtech.awkum.edu.pk"
];



// --- Middleware ---
// It's good practice to define middleware before routes

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ limit: "10mb", extended: true }));

// --- Routes ---
app.use("/api/auth", authroutes);
app.use("/api/user", userroutes);

// --- Main function to start the application ---
const startServer = async () => {
  try {
    // 1. FIRST, connect to the database and wait for it to succeed
    await dbconnect();

    // 2. THEN, and only then, start listening for requests
    const PORT = process.env.PORT || 8001;
    app.listen(PORT, () => {
      console.log(`Server is now running on port ${PORT}`);
    });

  } catch (error) {
    // If the database connection fails, log the error and don't start the server
    console.error("CRITICAL: Could not connect to the database. Server is not starting.");
    console.error(error);
    process.exit(1); // Exit the process with an error code
  }
};

// --- Execute the startup function ---
startServer();