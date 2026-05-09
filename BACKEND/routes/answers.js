const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/auth");

// POST /api/answers
// Creates a new answer for a question
// This route is protected - user must be logged in
router.post("/", authenticateToken, (req, res) => {
  // Get the question id and answer body from the request
  const { question_id, body } = req.body;

  // Validate that all fields are provided
  if (!question_id || !body) {
    return res.status(400).json({ error: "All fields required" });
  }

  // Validate that the answer is long enough
  if (body.trim().length < 5) {
    return res.status(400).json({ error: "Answer is too short" });
  }

  // Get the user id from the token - set by authenticateToken middleware
  const user_id = req.user.id;

  // Make sure the question actually exists before posting an answer
  db.query(
    "SELECT id FROM questions WHERE id = ?",
    [question_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Question not found" });
      }

      // Insert the new answer into the database
      db.query(
        "INSERT INTO answers (question_id, user_id, body) VALUES (?, ?, ?)",
        [question_id, user_id, body],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: "Failed to post answer" });
          }
          res.json({ message: "Answer posted successfully", id: result.insertId });
        }
      );
    }
  );
});

// GET /api/answers?question_id=1
// Returns all answers for a specific question
// This route is public - anyone can view answers
router.get("/", (req, res) => {
  const { question_id } = req.query;

  // Validate that question_id was provided
  if (!question_id) {
    return res.status(400).json({ error: "question_id is required" });
  }

  // Query answers and join with users table to get the author username
  db.query(
    `SELECT answers.id, answers.body, answers.created_at,
            users.username AS author
     FROM answers
     JOIN users ON answers.user_id = users.id
     WHERE answers.question_id = ?
     ORDER BY answers.created_at ASC`,
    [question_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch answers" });
      }
      res.json(results);
    }
  );
});

// Export the router so server.js can use it
module.exports = router;