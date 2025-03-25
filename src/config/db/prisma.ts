// src/config/db/prisma.ts
import { PrismaClient } from '@prisma/client';
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

// Get the database path and set it in the environment
const dbPath = getDbPath();
process.env.DATABASE_URL = `file:${dbPath}?connection_limit=1&pragma=journal_mode=WAL`;

// Create Prisma client with singleton pattern
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances in development
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  
  prisma = globalWithPrisma.prisma;
}

// Initialize database connection
export const initializeDatabase = async (): Promise<PrismaClient> => {
  try {
    // Test connection by executing a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    Logger.info(
      `Database connection established successfully for environment: ${
        process.env.NODE_ENV || "development"
      }`
    );
    
    Logger.info("Using WAL mode via connection string parameter");
    
    return prisma;
  } catch (error) {
    Logger.error("Unable to connect to the database:", error);
    return prisma; // Return instance anyway, let caller handle connection issues
  }
};

export default prisma;