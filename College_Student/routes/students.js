// routes/students.js
import express from "express";
import { Student, User } from "../models/index.js";
import { authMiddleware } from "../middleware/auth.js";
import { permit } from "../middleware/role.js";
import { sequelize } from "../db.js";

const router = express.Router();

// Create student (admin only)
router.post("/", authMiddleware, permit("admin"), async (req, res) => {
  const { studentId, name, email, department, year, dob, phone, address } =
    req.body;
  try {
    const exists = await Student.findOne({ where: { studentId } });
    if (exists)
      return res.status(400).json({ error: "StudentId already exists" });

    const student = await Student.create({
      studentId,
      name,
      email,
      department,
      year,
      dob,
      phone,
      address,
    });
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get list (admin) with pagination
router.get("/", authMiddleware, permit("admin"), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    const { count, rows } = await Student.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    res.json({
      total: count,
      page,
      perPage: limit,
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single student (admin or the student themself)
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findByPk(id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // if user is student, allow only their own record
    if (req.user.role === "student") {
      // find linked user
      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(403).json({ error: "Forbidden" });
      if (student.userId !== user.id)
        return res.status(403).json({ error: "Forbidden" });
    }

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update student (admin or linked student)
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findByPk(id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    if (req.user.role === "student" && student.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await student.update(req.body);
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete student (admin only)
router.delete("/:id", authMiddleware, permit("admin"), async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findByPk(id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    await student.destroy();
    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// optional: get current student's profile
router.get(
  "/me/profile",
  authMiddleware,
  permit("student"),
  async (req, res) => {
    try {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (!student) return res.status(404).json({ error: "Profile not found" });
      res.json(student);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
