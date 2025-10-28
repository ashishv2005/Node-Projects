// models/User.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
    bio: { type: DataTypes.TEXT, allowNull: true },
    avatar: { type: DataTypes.STRING, allowNull: true },
  },
  { timestamps: true }
);

export default User;
