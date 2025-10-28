// db.js
import dotenv from "dotenv"; // .env ફાઈલ લાવવા માટે
import { Sequelize } from "sequelize"; // Sequelize class import

dotenv.config(); // .env વાંચી લો

// Sequelize instance બનાવીએ (MySQL dialect)
export const sequelize = new Sequelize(
  process.env.DB_NAME, // DB name
  process.env.DB_USER, // DB user
  process.env.DB_PASSWORD, // DB password
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // development માં true રાખશો તો SQL logs મળશે
  }
);
