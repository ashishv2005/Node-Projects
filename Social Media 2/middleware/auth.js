// middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const blacklistedTokens = new Set();
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // "Bearer <token>"
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  if (blacklistedTokens.has(token)) {
    return res.status(401).json({ error: "Token has been logged out" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const blacklistToken = (token) => {
  blacklistedTokens.add(token);
};
