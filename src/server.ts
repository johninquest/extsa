import app from "./app";
import { initializeDatabase } from "./config/database"; // Updated to use Sequelize
import Logger from "./config/logger";
import "dotenv/config";

const port = process.env.PORT;

const startServer = async () => {
  try {
    Logger.info("Attempting to initialize database");
    const dbInitialized = await initializeDatabase();

    if (!dbInitialized) {
      Logger.error("Failed to initialize database. Exiting.");
      process.exit(1);
    }

    Logger.info("Database initialization completed");

    app.listen(port, () => {
      Logger.info(`Server running on port => ${port}`);
      Logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    Logger.error("Unhandled error during application startup", error);
    process.exit(1);
  }
};

startServer();