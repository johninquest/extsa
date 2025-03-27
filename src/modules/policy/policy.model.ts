import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { eq, isNull } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import db from '../../config/db/libsql';
import logger from '../../config/logger';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const generateId = customAlphabet(alphabet, 21);

// ==========================================
// Schema Definition
// ==========================================

// Define the policies table schema
export const policies = sqliteTable('policies', {
  // Primary key using nanoid
  id: text('id').primaryKey().$defaultFn(() => generateId()),
  
  // Policy fields
  policy_type: text('policy_type').notNull(),
  policy_number: text('policy_number').notNull(),
  insurance_provider: text('insurance_provider').notNull(),
  policy_comment: text('policy_comment'),
  
  // Date fields
  start_date: integer('start_date', { mode: 'timestamp' }),
  end_date: integer('end_date', { mode: 'timestamp' }).notNull(),
  
  // Boolean fields
  automatic_renewal: integer('automatic_renewal').notNull().default(0), // 0 for false, 1 for true
  
  // User reference
  created_by: text('created_by').notNull(),
  
  // Numeric fields
  premium: real('premium').notNull(),
  payment_frequency: integer('payment_frequency').notNull(),
  
  // Additional fields
  agent: text('agent'),
  claims: text('claims', { mode: 'json' }).$type<string[]>().default(sql`json('[]')`),
  
  // Soft delete
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  
  // Timestamps
  created: integer('created', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`),
  updated: integer('updated', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`)
});

// Type for inserting a new policy
export type NewPolicy = typeof policies.$inferInsert;

// Type for selecting a policy
export type Policy = typeof policies.$inferSelect;

// ==========================================
// Data Access Methods
// ==========================================

/**
 * Create a new policy
 */
export async function create(policyData: Omit<NewPolicy, 'id' | 'created' | 'updated'>): Promise<Policy> {
  try {
    const result = await db.insert(policies).values({
      ...policyData,
      id: generateId(),
    }).returning();
    return result[0];
  } catch (error) {
    logger.error('Error creating policy:', error);
    throw error;
  }
}

/**
 * Find a policy by ID
 */
export async function findById(id: string): Promise<Policy | undefined> {
  try {
    const result = await db
      .select()
      .from(policies)
      .where(eq(policies.id, id))
      .limit(1);
    
    return result[0];
  } catch (error) {
    logger.error(`Error finding policy by ID ${id}:`, error);
    throw error;
  }
}

/**
 * Find policies by creator
 */
export async function findByCreator(createdBy: string): Promise<Policy[]> {
  try {
    const result = await db
      .select()
      .from(policies)
      .where(eq(policies.created_by, createdBy));
    
    return result;
  } catch (error) {
    logger.error(`Error finding policies for creator ${createdBy}:`, error);
    throw error;
  }
}

/**
 * Update a policy
 */
export async function update(id: string, policyData: Partial<Omit<NewPolicy, 'id' | 'created' | 'updated'>>): Promise<Policy | undefined> {
  try {
    // Add updated timestamp
    const dataWithTimestamp = {
      ...policyData,
      updated: sql`${Math.floor(Date.now() / 1000)}` // Current timestamp in seconds
    };

    const result = await db
      .update(policies)
      .set(dataWithTimestamp)
      .where(eq(policies.id, id))
      .returning();
    
    return result[0];
  } catch (error) {
    logger.error(`Error updating policy ${id}:`, error);
    throw error;
  }
}

/**
 * Soft delete a policy
 */
export async function softDelete(id: string): Promise<boolean> {
  try {
    await db
      .update(policies)
      .set({ 
        deleted_at: sql`${Math.floor(Date.now() / 1000)}`, // Current timestamp in seconds
        updated: sql`${Math.floor(Date.now() / 1000)}`
      })
      .where(eq(policies.id, id));
    
    return true;
  } catch (error) {
    logger.error(`Error soft deleting policy ${id}:`, error);
    throw error;
  }
}

/**
 * Hard delete a policy (permanent deletion)
 */
export async function deletePolicy(id: string): Promise<boolean> {
  try {
    await db
      .delete(policies)
      .where(eq(policies.id, id));
    
    return true;
  } catch (error) {
    logger.error(`Error deleting policy ${id}:`, error);
    throw error;
  }
}

/**
 * Find all active policies (not soft-deleted)
 */
export async function findAll(): Promise<Policy[]> {
  try {
    return await db
      .select()
      .from(policies)
      .where(isNull(policies.deleted_at));
  } catch (error) {
    logger.error('Error finding all policies:', error);
    throw error;
  }
}

// Export everything as a default object for compatibility with existing code
export default {
  create,
  findById,
  findByCreator,
  update,
  softDelete,
  deletePolicy,
  findAll
};