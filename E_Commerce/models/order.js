// models/order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    total: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    address: { type: DataTypes.TEXT },
    paymentId: { type: DataTypes.STRING }, // from Stripe or gateway
  },
  { timestamps: true }
);

module.exports = Order;
