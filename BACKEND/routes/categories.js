const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/categories
// Returns all categories from the database
// This route is public - no authentication required
// Anyone can view the list of categories
router.get("/", (req, res) => {
  // Query the database for all categories
  // ORDER BY id keeps them in a consistent order
  db.query("SELECT * FROM categories ORDER BY id", (err, results) => {
    // If something went wrong with the query return a server error
    if (err) {
      return res.status(500).json({ error: "Failed to fetch categories" });
    }

    // Send the categories back as JSON
    // This will be an array of category objects
    // each with id, name, description, and icon
    res.json(results);
  });
});

// Export the router so server.js can use it
module.exports = router;