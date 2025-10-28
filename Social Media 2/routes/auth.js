// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/index.js";
import { authMiddleware } from "../middleware/auth.js";
import { blacklistToken } from "../middleware/auth.js";

dotenv.config();
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, role, adminSecret } = req.body;
  try {
    if (role === "admin" && adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Invalid admin secret" });
    }
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email already used" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "user",
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout with blacklist
router.post("/logout", authMiddleware, (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  blacklistToken(token); // 👈 token blacklist karo
  return res.json({ message: "Logged out successfully" });
});

export default router;
