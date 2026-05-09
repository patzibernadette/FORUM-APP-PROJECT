// Load environment variables from .env file
require("dotenv").config();
const mysql = require("mysql2");

// Create a connection to the MySQL database using environment variables
// Credentials are stored in .env to keep them out of the codebase
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database and log the result
db.connect((err) => {
  if (err) console.log("DB Connection Error:", err);
  else console.log("MySQL Connected");
});

// Export the connection so it can be used in route files
module.exports = db;
