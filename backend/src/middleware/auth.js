const { verifyToken, extractTokenFromHeader } = require("../utils/jwt");

function requireAuth(req, res, next) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }
    
    const decoded = verifyToken(token);
    
    req.user = decoded;
    
    return next();
  } catch (error) {
    if (error.message === "Token expired") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error.message === "Invalid token") {
      return res.status(401).json({ error: "Invalid token" });
    }
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = { requireAuth };

