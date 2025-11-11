// routes/admin.js
import express from "express";
import { User, Student } from "../models/index.js";
import { authMiddleware } from "../middleware/auth.js";
import { permit } from "../middleware/role.js";
import { sequelize } from "../db.js";

const router = express.Router();

// Stats: total students, total admins, students per department, recent students
router.get("/stats", authMiddleware, permit("admin"), async (req, res) => {
  try {
    const totalStudents = await Student.count();
    const totalAdmins = await User.count({ where: { role: "admin" } });

    // students per department
    const studentsByDept = await Student.findAll({
      attributes: [
        "department",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["department"],
    });

    const recentStudents = await Student.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      totalStudents,
      totalAdmins,
      studentsByDept,
      recentStudents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
