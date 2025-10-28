// index.js (excerpt)
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { sequelize } from "./db.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import postsRoutes from "./routes/posts.js";
import setupSocket from "./sockets/chat.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/posts", postsRoutes);

setupSocket(io); // <-- mount socket logic

const PORT = process.env.PORT || 4000;
(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true }); // dev only
  server.listen(PORT, () => console.log(`Server running on ${PORT}`));
})();
