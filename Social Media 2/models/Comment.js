// models/Comment.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Comment = sequelize.define(
  "Comment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    postId: { type: DataTypes.INTEGER, allowNull: false },
  },
  { timestamps: true }
);

export default Comment;
