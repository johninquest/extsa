// src/modules/auth/auth.service.ts
import prisma from '../../config/db/prisma';
import { generateId, UserRole } from '../user/user.model';
import { sendWelcomeEmail } from '../notification/email';

// Define the User type manually to match your Prisma schema
interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  provider?: string | null;
  role: string;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface FirebaseUserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: string;
}

export class AuthService {
  async findOrCreateUser(firebaseUser: FirebaseUserData): Promise<User | null> {
    try {
      // Try to find the user first
      const existingUser = await prisma.user.findUnique({
        where: { firebaseUid: firebaseUser.uid }
      });

      if (existingUser) {
        // User exists, update their details and last login
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            displayName: firebaseUser.displayName || existingUser.displayName,
            photoURL: firebaseUser.photoURL || existingUser.photoURL,
            lastLogin: new Date()
          }
        });
        
        return updatedUser;
      } else {
        // User doesn't exist, create a new one
        const newUser = await prisma.user.create({
          data: {
            id: generateId(),
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            provider: firebaseUser.provider,
            role: 'user' as UserRole, // Override model's default 'admin' for social logins
            lastLogin: new Date()
          }
        });

        // Send welcome email after creation
        await sendWelcomeEmail(newUser.email, newUser.displayName || 'User');
        
        return newUser;
      }
    } catch (error) {
      console.error("Error in findOrCreateUser:", error);
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error("Error in getUserById:", error);
      return null;
    }
  }
}