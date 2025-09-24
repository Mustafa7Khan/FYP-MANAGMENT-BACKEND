require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbconnect = require("./config/dbconnect.js");
const authroutes = require("./routes/authroutes.js");
const userroutes = require("./routes/userroutes");

// Create the Express app instance
const app = express();

// --- Middleware ---
// It's good practice to define middleware before routes
app.use(cors({ origin: "https://awkumtech.awkum.edu.pk", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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