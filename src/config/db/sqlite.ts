// src/config/db/sqlite.ts
import { Sequelize } from "sequelize";
import Logger from "../logger";
import path from "path";
import "dotenv/config";

// Determine database path based on environment
const getDbPath = () => {
  const env = process.env.NODE_ENV || "development";

  switch (env) {
    case "production":
      return path.resolve(__dirname, "../../../data/prod.db");
    case "test":
      return path.resolve(__dirname, "../../../data/test.db");
    case "development":
    default:
      return path.resolve(__dirname, "../../../data/dev.db");
  }
};

// Path to the SQLite database file
const dbPath = getDbPath();

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: process.env.NODE_ENV !== "production", // Only log in non-production
});

// Export the sequelize instance before importing models
export default sequelize;

// Import models
// import User from "../../modules/user/user.model";
// import Policy from "../../modules/policy/policy.model";

// Test the connection and initialize models
export const initializeDatabase = async (): Promise<Sequelize> => {
  try {
    await sequelize.authenticate();
    Logger.info(
      `Database connection established successfully for environment: ${
        process.env.NODE_ENV || "development"
      }`
    );
/* 
    // Enable Write-Ahead Logging (WAL)
    await sequelize.query("PRAGMA journal_mode=WAL;");
    Logger.info("Write-Ahead Logging (WAL) mode enabled.");

    // Sync models (creates tables if they don't exist)
    await User.sync();
    Logger.info("User model synchronized successfully.");
    await Policy.sync();
    Logger.info("Policy model synchronized successfully."); */

    return sequelize;
  } catch (error) {
    Logger.error("Unable to connect to the database:", error);
    throw error;
  }
};
