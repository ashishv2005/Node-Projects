// models/Message.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Message = sequelize.define(
  "Message",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    receiverId: { type: DataTypes.INTEGER, allowNull: false },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: true }
);

export default Message;
