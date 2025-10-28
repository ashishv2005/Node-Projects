// models/index.js
import User from "./User.js";
import Post from "./Post.js";
import Comment from "./Comment.js";
import Like from "./Like.js";
import Message from "./Message.js";

// Associations

// User - Post (1:N)
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

// Post - Comment (1:N)
Post.hasMany(Comment, { foreignKey: "postId", onDelete: "CASCADE" });
Comment.belongsTo(Post, { foreignKey: "postId" });

// User - Comment (1:N)
User.hasMany(Comment, { foreignKey: "userId", onDelete: "CASCADE" });
Comment.belongsTo(User, { foreignKey: "userId" });

// Likes Many-to-Many (through Like)
User.belongsToMany(Post, {
  through: Like,
  as: "LikedPosts",
  foreignKey: "userId",
});
Post.belongsToMany(User, { through: Like, as: "Likers", foreignKey: "postId" });

// Messages (User -> Message)
User.hasMany(Message, { foreignKey: "senderId", as: "SentMessages" });
User.hasMany(Message, { foreignKey: "receiverId", as: "ReceivedMessages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "Sender" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "Receiver" });

export { User, Post, Comment, Like, Message };
