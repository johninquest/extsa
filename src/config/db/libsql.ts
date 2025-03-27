import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import logger from '../logger';

// Database URL from environment (defaults to libsql service in docker compose)
const databaseUrl = process.env.DATABASE_URL || 'http://libsql:8080';

// Create libSQL client
export const client = createClient({ 
  url: databaseUrl 
});

// Create and export the database instance without schema
// Schemas will be added by individual modules
export const db = drizzle(client);

// Function to initialize the database with performance optimizations
export async function initializeDatabase() {
  try {
    
    // Check database connection
    await client.execute('SELECT 1');
    logger.info('Database connection successful');
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    return false;
  }
}

export default db;