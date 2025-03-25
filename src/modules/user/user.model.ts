// src/modules/user/user.model.ts
import { customAlphabet } from 'nanoid';

// Custom ID generation
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const generateId = customAlphabet(alphabet, 21);

// Role type definition
export type UserRole = 'admin' | 'user';

// These types can be useful for when you're working with users in your application
export interface UserCreateInput {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
  role?: UserRole;
  lastLogin?: Date;
}

export interface UserUpdateInput {
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
  role?: UserRole;
  lastLogin?: Date;
}