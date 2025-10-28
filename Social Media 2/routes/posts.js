// routes/posts.js
import express from "express";
import { Post, User, Comment, Like, Message } from "../models/index.js";
import { authMiddleware } from "../middleware/auth.js";
import permit from "../middleware/role.js";
import { Op } from "sequelize";

const router = express.Router();

// Create post
router.post("/", authMiddleware, async (req, res) => {
  const { content, image } = req.body;
  try {
    const post = await Post.create({ content, image, userId: req.user.id });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get feed (with author, commentsCount, likesCount)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, attributes: ["id", "name", "avatar"] },
        { model: Comment, attributes: ["id"] },
        {
          model: User,
          as: "Likers",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    const mapped = posts.map((p) => ({
      id: p.id,
      content: p.content,
      image: p.image,
      createdAt: p.createdAt,
      author: p.User,
      commentsCount: p.Comments ? p.Comments.length : 0,
      likesCount: p.Likers ? p.Likers.length : 0,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single post
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ["id", "name", "avatar"] },
        {
          model: Comment,
          include: [{ model: User, attributes: ["id", "name", "avatar"] }],
        },
        {
          model: User,
          as: "Likers",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update post (owner or admin)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (req.user.role !== "admin" && post.userId !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    await post.update(req.body);
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete post (owner or admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (req.user.role !== "admin" && post.userId !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    await post.destroy();
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Comments: create
router.post("/:postId/comments", authMiddleware, async (req, res) => {
  const { text } = req.body;
  const { postId } = req.params;
  try {
    const comment = await Comment.create({ text, postId, userId: req.user.id });
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update comment (owner or admin)
router.put("/:postId/comments/:commentId", authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (req.user.role !== "admin" && comment.userId !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    await comment.update({ text: req.body.text });
    res.json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete comment (owner or admin)
router.delete(
  "/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.commentId);
      if (!comment) return res.status(404).json({ error: "Comment not found" });
      if (req.user.role !== "admin" && comment.userId !== req.user.id)
        return res.status(403).json({ error: "Forbidden" });
      await comment.destroy();
      res.json({ message: "Comment deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Like/unlike toggle
router.post("/:postId/like", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.postId, 10);
  try {
    const exists = await Like.findOne({ where: { userId, postId } });
    if (exists) {
      await exists.destroy();
      return res.json({ liked: false });
    }
    await Like.create({ userId, postId });
    res.json({ liked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get likes count/list
router.get("/:postId/likes", authMiddleware, async (req, res) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const likes = await Like.findAll({
      where: { postId },
      include: [{ model: User, attributes: ["id", "name", "avatar"] }],
    });
    res.json({ count: likes.length, users: likes.map((l) => l.User) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------- MESSAGES -------------------- //

// Get conversation
router.get(
  "/messages/conversation/:userId",
  authMiddleware,
  async (req, res) => {
    const loggedInUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId, 10);

    try {
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId: loggedInUserId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: loggedInUserId },
          ],
        },
        order: [["createdAt", "ASC"]],
        include: [
          { model: User, as: "Sender", attributes: ["id", "name", "email"] },
          { model: User, as: "Receiver", attributes: ["id", "name", "email"] },
        ],
      });
      res.json(messages);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Send a message
router.post("/messages/:userId", authMiddleware, async (req, res) => {
  const loggedInUserId = req.user.id;
  const receiverId = parseInt(req.params.userId, 10);
  const { content } = req.body;

  try {
    const msg = await Message.create({
      senderId: loggedInUserId,
      receiverId,
      content,
    });
    res.status(201).json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark as read
router.put("/messages/:id/read", authMiddleware, async (req, res) => {
  try {
    const msg = await Message.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ error: "Message not found" });

    if (msg.receiverId !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });

    msg.read = true;
    await msg.save();
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
