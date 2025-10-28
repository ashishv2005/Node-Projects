// models/Like.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Like = sequelize.define(
  "Like",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    postId: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ["userId", "postId"] }],
  }
);

export default Like;
