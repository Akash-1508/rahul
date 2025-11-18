const jwt = require("jsonwebtoken");

// JWT Secret - must be in .env file
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables. Please add it to .env file");
}

// JWT Expiry - must be in .env file
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
if (!JWT_EXPIRES_IN) {
  throw new Error("JWT_EXPIRES_IN is not set in environment variables. Please add it to .env file");
}

// Type assertion after validation
const JWT_SECRET_VALUE = JWT_SECRET;
const JWT_EXPIRES_IN_VALUE = JWT_EXPIRES_IN;

/**
 * Generate JWT token with user data
 * @param {Object} payload - User payload (userId, email, mobile, name, role)
 * @returns {string} JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET_VALUE, {
    expiresIn: JWT_EXPIRES_IN_VALUE,
  });
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_VALUE);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
}

/**
 * Extract token from Authorization header
 * @param {string|undefined} authHeader - Authorization header value
 * @returns {string|null} Extracted token or null
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
};

