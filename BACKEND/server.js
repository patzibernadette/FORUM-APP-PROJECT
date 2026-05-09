// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Initialize Express app
const app = express();

// Middleware - allow cross-origin requests from frontend
app.use(cors());

// Middleware - parse incoming JSON request bodies
app.use(express.json());

// Import route handlers
const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const questionRoutes = require("./routes/questions");
const answerRoutes = require("./routes/answers");

// Mount routes - all API endpoints are prefixed with /api
app.use("/api/auth", authRoutes); // handles login and registration
app.use("/api/categories", categoryRoutes); // handles forum categories
app.use("/api/questions", questionRoutes); // handles questions per category
app.use("/api/answers", answerRoutes); // handles answers per question

// Start the server on the port defined in .env or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
