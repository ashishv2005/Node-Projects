// index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { sequelize } from "./db.js";
import authRoutes from "./routes/auth.js";
import studentsRoutes from "./routes/students.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/admin", adminRoutes);

// health
app.get("/", (req, res) => res.send("College portal backend is up"));

// start + db sync
const PORT = process.env.PORT || 4000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    await sequelize.sync({ alter: true }); // development only; use migrations in prod
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error("Failed to start server", err);
  }
})();
