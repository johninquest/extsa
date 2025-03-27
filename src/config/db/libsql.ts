// src/config/db/libsql.ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import logger from '../logger';

// Database URL from environment (defaults to libsql service in Docker)
const databaseUrl = process.env.DATABASE_URL || 'http://libsql:8080';

// Create libSQL client
export const client = createClient({ url: databaseUrl });

// Create and export the database instance
export const db = drizzle(client);

// Simple function to manually create tables
async function setupTables() {
  try {
    // Create users table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        firebase_uid TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        display_name TEXT,
        photo_url TEXT,
        provider TEXT,
        role TEXT NOT NULL DEFAULT 'admin',
        last_login INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    // Create policies table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS policies (
        id TEXT PRIMARY KEY,
        policy_type TEXT NOT NULL,
        policy_number TEXT NOT NULL,
        insurance_provider TEXT NOT NULL,
        policy_comment TEXT,
        start_date INTEGER,
        end_date INTEGER NOT NULL,
        automatic_renewal INTEGER NOT NULL DEFAULT 0,
        created_by TEXT NOT NULL,
        premium REAL NOT NULL,
        payment_frequency INTEGER NOT NULL,
        agent TEXT,
        claims TEXT DEFAULT '[]',
        deleted_at INTEGER,
        created INTEGER DEFAULT (strftime('%s', 'now')),
        updated INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    logger.info('Database tables created or verified');
    return true;
  } catch (error) {
    logger.error('Error creating database tables:', error);
    return false;
  }
}

// Function to initialize the database
export async function initializeDatabase() {
  try {
    // Check database connection
    await client.execute('SELECT 1');
    logger.info('Database connection successful');
    
    // Create tables if they don't exist
    await setupTables();
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    return false;
  }
}

export default db;