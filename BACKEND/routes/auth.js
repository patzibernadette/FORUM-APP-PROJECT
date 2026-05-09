const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// REGISTER - POST /api/auth/register
// Creates a new user account
router.post("/register", async (req, res) => {
  // Destructure the fields sent from the frontend form
  const { username, email, password } = req.body;

  // Validate that all fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  try {
    // Hash the password before storing
    // 10 is the number of salt rounds - higher is more secure but slower
    // Never store plain text passwords in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
      (err, result) => {
        // If username or email already exists MySQL will throw a duplicate error
        if (err) {
          return res.status(400).json({ error: "Username or email already exists" });
        }
        // Registration successful
        res.json({ message: "Registered successfully" });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN - POST /api/auth/login
// Authenticates a user and returns a JWT token
router.post("/login", (req, res) => {
  // Destructure the fields sent from the frontend form
  const { username, password } = req.body;

  // Validate that all fields are provided
  if (!username || !password) {
    return res.status(400).json({ error: "All fields required" });
  }

  // Look up the user in the database by username
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      // If query error or user not found return a generic message
      // We don't want to tell hackers which field is wrong
      if (err || result.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid login" });
      }

      // Compare the submitted password against the stored hashed password
      const validPassword = await bcrypt.compare(password, result[0].password);
      if (!validPassword) {
        return res.status(401).json({ success: false, message: "Invalid login" });
      }

      // Generate a JWT token valid for 1 day
      // The token contains the user id and username
      // The frontend will store this and send it with future requests
      const token = jwt.sign(
        { id: result[0].id, username: result[0].username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Return the token and user info to the client
      res.json({
        success: true,
        token,
        username: result[0].username,
        userId: result[0].id,
      });
    }
  );
});

// Export the router so server.js can use it
module.exports = router;