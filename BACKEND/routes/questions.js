const express = require("express");
const router = express.Router();
const db = require("../db");
const authenticateToken = require("../middleware/auth");

// GET /api/questions?category_id=1
// Returns all questions for a specific category
// This route is public - anyone can view questions
router.get("/", (req, res) => {
  // Get the category_id from the query string
  // Example: /api/questions?category_id=1
  const { category_id } = req.query;

  // Validate that category_id was provided
  if (!category_id) {
    return res.status(400).json({ error: "category_id is required" });
  }

  // Query questions and join with users table to get the author username
  // Also count the number of answers for each question
  // ORDER BY created_at DESC shows newest questions first
  db.query(
    `SELECT questions.id, questions.title, questions.body, 
            questions.created_at, users.username AS author,
            COUNT(answers.id) AS answer_count
     FROM questions
     JOIN users ON questions.user_id = users.id
     LEFT JOIN answers ON answers.question_id = questions.id
     WHERE questions.category_id = ?
     GROUP BY questions.id
     ORDER BY questions.created_at DESC`,
    [category_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch questions" });
      }
      res.json(results);
    }
  );
});

// GET /api/questions/:id
// Returns a single question with all its answers
// This route is public - anyone can view a question
router.get("/:id", (req, res) => {
  const { id } = req.params;

  // First get the question details
  db.query(
    `SELECT questions.id, questions.title, questions.body,
            questions.created_at, users.username AS author
     FROM questions
     JOIN users ON questions.user_id = users.id
     WHERE questions.id = ?`,
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Failed to fetch question" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "Question not found" });
      }

      const question = results[0];

      // Then get all answers for this question
      db.query(
        `SELECT answers.id, answers.body, answers.created_at,
                users.username AS author
         FROM answers
         JOIN users ON answers.user_id = users.id
         WHERE answers.question_id = ?
         ORDER BY answers.created_at ASC`,
        [id],
        (err, answers) => {
          if (err) {
            return res.status(500).json({ error: "Failed to fetch answers" });
          }

          // Attach the answers array to the question object and send it back
          res.json({ ...question, answers });
        }
      );
    }
  );
});

// POST /api/questions
// Creates a new question
// This route is protected - user must be logged in
router.post("/", authenticateToken, (req, res) => {
  const { title, body, category_id } = req.body;

  // Validate that all fields are provided
  if (!title || !body || !category_id) {
    return res.status(400).json({ error: "All fields required" });
  }

  // Get the user id from the token - set by authenticateToken middleware
  const user_id = req.user.id;

  // Insert the new question into the database
  db.query(
    "INSERT INTO questions (user_id, category_id, title, body) VALUES (?, ?, ?, ?)",
    [user_id, category_id, title, body],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Failed to post question" });
      }
      res.json({ message: "Question posted successfully", id: result.insertId });
    }
  );
});

// Export the router so server.js can use it
module.exports = router;