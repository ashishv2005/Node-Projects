// models/Post.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Post = sequelize.define(
  "Post",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
  },
  { timestamps: true }
);

export default Post;
