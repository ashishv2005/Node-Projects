// models/orderItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 },
    price: { type: DataTypes.FLOAT, allowNull: false },
  },
  { timestamps: true }
);

module.exports = OrderItem;
