import { DataTypes, Model, Optional } from 'sequelize';
import { customAlphabet } from 'nanoid';
import sequelize from '../../config/db/sqlite'; // Adjust the import path as needed

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const generateId = customAlphabet(alphabet, 21);

interface UserAttributes {
  id: string;
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
  role: string;
  lastLogin?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'displayName' | 'photoURL' | 'provider' | 'lastLogin'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public firebaseUid!: string;
  public email!: string;
  public displayName?: string;
  public photoURL?: string;
  public provider?: string;
  public role!: string;
  public lastLogin?: Date;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.STRING(21),
      primaryKey: true,
      defaultValue: () => generateId(),
    },
    firebaseUid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photoURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    provider: {
      type: DataTypes.STRING, // 'google', 'facebook', etc.
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'admin',
      validate: {
        isIn: [['admin', 'user']], // Add any other roles you need
      },
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize, // Pass the sequelize instance here
    tableName: 'users',
    underscored: true,
  }
);

export default User;