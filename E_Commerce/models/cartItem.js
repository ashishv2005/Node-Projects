// models/cartItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 1 },
  },
  { timestamps: true }
);

module.exports = CartItem;
