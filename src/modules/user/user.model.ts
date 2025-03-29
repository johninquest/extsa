// src/modules/user/user.model.ts
import { Sequelize, Model, DataTypes, Association } from 'sequelize';
import { Policy } from '../policy/policy.model';

export class User extends Model {
  declare id: string;
  declare firebase_uid: string;
  declare email: string;
  declare display_name?: string;
  declare photo_url?: string;
  declare provider?: string;
  declare role: string;
  declare last_login?: Date;
  declare created_at: Date;
  declare updated_at: Date;

  // Association declarations
  declare policies?: Policy[];
  declare static associations: {
    policies: Association<User, Policy>;
  };
}

export function initializeUserModel(sequelize: Sequelize): typeof User {
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id'
    },
    firebase_uid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      field: 'firebase_uid'
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      field: 'email'
    },
    display_name: {
      type: DataTypes.STRING,
      field: 'display_name'
    },
    photo_url: {
      type: DataTypes.STRING,
      field: 'photo_url'
    },
    provider: {
      type: DataTypes.STRING,
      field: 'provider'
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
      field: 'role'
    },
    last_login: {
      type: DataTypes.DATE,
      field: 'last_login'
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Define associations
  User.hasMany(Policy, {
    foreignKey: 'created_by',
    as: 'policies'
  });

  return User;
}