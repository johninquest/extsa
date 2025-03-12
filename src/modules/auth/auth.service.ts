import User from '../user/user.model'; // Adjusted import to default import
import sequelize from '../../config/db/sqlite';
import { Transaction } from 'sequelize';

interface FirebaseUserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider: string;
}

export class AuthService {
  async findOrCreateUser(firebaseUser: FirebaseUserData): Promise<User> {
    return sequelize.transaction(async (transaction: Transaction) => {
      const [user, created] = await User.findOrCreate({
        where: { firebaseUid: firebaseUser.uid },
        defaults: {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          provider: firebaseUser.provider,
          role: 'user', // Override model's default 'admin' for social logins
          lastLogin: new Date()
        },
        transaction
      });

      if (!created) {
        await user.update({
          displayName: firebaseUser.displayName || user.displayName,
          photoURL: firebaseUser.photoURL || user.photoURL,
          lastLogin: new Date()
        }, { transaction });
      }

      return user;
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }
}