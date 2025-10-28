// routes/users.js
import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { authMiddleware } from "../middleware/auth.js";
import permit from "../middleware/role.js";

const router = express.Router();

// Get list (admin)
router.get("/", authMiddleware, permit("admin"), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get current user
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single (admin or self)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (req.user.role !== "admin" && req.user.id !== targetId)
      return res.status(403).json({ error: "Forbidden" });
    const user = await User.findByPk(targetId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update (admin or self)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (req.user.role !== "admin" && req.user.id !== targetId)
      return res.status(403).json({ error: "Forbidden" });
    const user = await User.findByPk(targetId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, password, bio, avatar } = req.body;
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.bio = bio ?? user.bio;
    user.avatar = avatar ?? user.avatar;
    await user.save();
    const out = user.toJSON();
    delete out.password;
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete (admin)
router.delete("/:id", authMiddleware, permit("admin"), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.destroy();
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
