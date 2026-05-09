// Import the jsonwebtoken library to verify JWT tokens
const jwt = require("jsonwebtoken");

// This middleware function runs before protected routes
// It checks if the request has a valid JWT token
function authenticateToken(req, res, next) {
  // Get the Authorization header from the request
  // It looks like: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  const authHeader = req.headers["authorization"];

  // Extract just the token part after "Bearer "
  // If there is no header, token will be undefined
  const token = authHeader && authHeader.split(" ")[1];

  // If no token was provided, block the request
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  // Verify the token using our JWT secret from .env
  // If the token is valid, it decodes the payload (id, username)
  // If the token is invalid or expired, it throws an error
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // If verification failed, block the request
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Token is valid — attach the decoded user info to the request
    // This lets route handlers know who is making the request
    // e.g. req.user.id or req.user.username
    req.user = user;

    // Call next() to move on to the actual route handler
    next();
     });
}

// Export the function so routes can import and use it
module.exports = authenticateToken;