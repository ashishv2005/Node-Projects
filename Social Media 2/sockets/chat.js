// sockets/chat.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Message, User } from "../models/index.js";

dotenv.config();

const onlineUsers = new Map(); // userId -> socketId

export default function setupSocket(io) {
  // socket-level auth middleware (handshake)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role, iat, exp }
      return next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    onlineUsers.set(userId, socket.id);
    socket.join(`user_${userId}`); // personal room

    // Optionally broadcast online users
    io.emit("online_users", Array.from(onlineUsers.keys()));

    // Private message: { to: <userId>, content: "hi" }
    socket.on("private_message", async ({ to, content }) => {
      try {
        // save to DB
        const msg = await Message.create({
          content,
          senderId: userId,
          receiverId: to,
        });
        // emit to receiver if online
        const receiverSocketId = onlineUsers.get(to);
        const payload = {
          id: msg.id,
          content: msg.content,
          from: userId,
          to,
          createdAt: msg.createdAt,
        };
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("private_message", payload);
        }
        // ack to sender
        socket.emit("private_message_sent", payload);
      } catch (err) {
        console.error("socket message error", err);
        socket.emit("error", { message: "Message not sent" });
      }
    });

    // typing indicator { to: <userId>, isTyping: true/false }
    socket.on("typing", ({ to, isTyping }) => {
      const receiverSocketId = onlineUsers.get(to);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { from: userId, isTyping });
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });
}
