import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { eq } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import db from '../../config/db/libsql';
import logger from '../../config/logger';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const generateId = customAlphabet(alphabet, 21);

// ==========================================
// Schema Definition
// ==========================================

// Define the users table schema
export const users = sqliteTable('users', {
  // Primary key using nanoid
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  
  // Firebase authentication fields
  firebaseUid: text('firebase_uid').notNull().unique(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  provider: text('provider'),
  
  // User role with check constraint
  role: text('role').notNull().default('admin'),
  
  // Timestamp fields
  lastLogin: integer('last_login', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`)
});

// Type for inserting a new user
export type NewUser = typeof users.$inferInsert;

// Type for selecting a user
export type User = typeof users.$inferSelect;

// ==========================================
// Data Access Methods
// ==========================================

/**
 * Create a new user
 */
export async function create(userData: Omit<NewUser, 'createdAt' | 'updatedAt'>): Promise<User> {
  try {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Find a user by ID
 */
export async function findById(id: string): Promise<User | undefined> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    return result[0];
  } catch (error) {
    logger.error(`Error finding user by ID ${id}:`, error);
    throw error;
  }
}

/**
 * Find a user by Firebase UID
 */
export async function findByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .limit(1);
    
    return result[0];
  } catch (error) {
    logger.error(`Error finding user by Firebase UID ${firebaseUid}:`, error);
    throw error;
  }
}

/**
 * Find a user by email
 */
export async function findByEmail(email: string): Promise<User | undefined> {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return result[0];
  } catch (error) {
    logger.error(`Error finding user by email ${email}:`, error);
    throw error;
  }
}

/**
 * Update a user
 */
export async function update(id: string, userData: Partial<Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | undefined> {
  try {
    // Add updated timestamp
    const dataWithTimestamp = {
      ...userData,
      updatedAt: sql`${Math.floor(Date.now() / 1000)}` // Current timestamp in seconds
    };

    const result = await db
      .update(users)
      .set(dataWithTimestamp)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  } catch (error) {
    logger.error(`Error updating user ${id}:`, error);
    throw error;
  }
}

/**
 * Update last login time
 */
export async function updateLastLogin(id: string): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({ 
        lastLogin: sql`${Math.floor(Date.now() / 1000)}`, // Current timestamp in seconds
        updatedAt: sql`${Math.floor(Date.now() / 1000)}`
      })
      .where(eq(users.id, id));
    
    return true;
  } catch (error) {
    logger.error(`Error updating last login for user ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<boolean> {
  try {
    await db
      .delete(users)
      .where(eq(users.id, id));
    
    return true;
  } catch (error) {
    logger.error(`Error deleting user ${id}:`, error);
    throw error;
  }
}

/**
 * Find all users
 */
export async function findAll(): Promise<User[]> {
  try {
    return await db.select().from(users);
  } catch (error) {
    logger.error('Error finding all users:', error);
    throw error;
  }
}

// Export everything as a default object for compatibility with existing code
export default {
  create,
  findById,
  findByFirebaseUid,
  findByEmail,
  update,
  updateLastLogin,
  deleteUser,
  findAll
};