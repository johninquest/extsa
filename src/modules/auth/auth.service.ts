// src/modules/auth/auth.service.ts
import { User } from '../user/user.model';
import { sendWelcomeEmail } from '../notification/email';

interface FirebaseUserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: string;
}

export class AuthService {
  async findOrCreateUser(firebaseUser: FirebaseUserData) {
    try {
      // Try to find the user first
      const [user, created] = await User.findOrCreate({
        where: { firebaseUid: firebaseUser.uid },
        defaults: {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName ?? null,
          photoURL: firebaseUser.photoURL ?? null,
          provider: firebaseUser.provider,
          role: 'user', // Override model's default 'admin' for social logins
          lastLogin: new Date()
        }
      });

      // If user exists, update last login and other fields
      if (!created) {
        await user.update({
          displayName: firebaseUser.displayName || user.display_name,
          photoURL: firebaseUser.photoURL || user.photo_url,
          lastLogin: new Date()
        });
      }

      // Send welcome email only for newly created users
      if (created) {
        await sendWelcomeEmail(
          user.email, 
          user.display_name || 'User'
        );
      }

      return user;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  async getUserById(id: string) {
    return User.findByPk(id);
  }

  async updateUserProfile(id: string, updateData: Partial<FirebaseUserData>) {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user.update({
      displayName: updateData.displayName ?? user.display_name,
      photoURL: updateData.photoURL ?? user.photo_url,
      provider: updateData.provider ?? user.provider
    });
  }
}