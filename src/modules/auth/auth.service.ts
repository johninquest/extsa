// In auth.service.ts
import userModel, { User } from '../user/user.model';
import { client } from '../../config/db/libsql';
import { sendWelcomeEmail } from '../notification/email';
import { FirebaseUser } from '../../config/firebase';

interface FirebaseUserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: string;
}

export class AuthService {
  async findOrCreateUser(firebaseUser: FirebaseUserData): Promise<User> {
    try {
      // Try to find the user first (outside transaction)
      const existingUser = await userModel.findByFirebaseUid(firebaseUser.uid);
      
      if (existingUser) {
        // User exists, update last login and other fields
        const updatedUser = await userModel.update(existingUser.id, {
          displayName: firebaseUser.displayName || existingUser.displayName,
          photoURL: firebaseUser.photoURL || existingUser.photoURL,
          lastLogin: new Date()
        });
        
        return updatedUser || existingUser;
      } else {
        // User doesn't exist, create a new one
        const newUser = await userModel.create({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          provider: firebaseUser.provider,
          role: 'user', // Override model's default 'admin' for social logins
          lastLogin: new Date()
        });
        
        // Send welcome email
        await sendWelcomeEmail(newUser.email, newUser.displayName || 'User');
        
        return newUser;
      }
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    return userModel.findById(id);
  }
}