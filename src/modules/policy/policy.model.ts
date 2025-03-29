// src/modules/policy/policy.model.ts
import { Sequelize, Model, DataTypes, Association } from 'sequelize';
import { User } from '../user/user.model';

export class Policy extends Model {
  declare id: string;
  declare policy_type: string;
  declare policy_number: string;
  declare insurer: string;
  declare policy_comment?: string;
  declare start_date?: Date;
  declare end_date: Date;
  declare automatic_renewal: boolean;
  declare created_by: string;
  declare premium: number;
  declare payment_frequency: number;
  declare agent?: string;
  declare claims: string[];
  declare deleted_at?: Date;

  // Association declarations
  declare user?: User;
  declare static associations: {
    user: Association<Policy, User>;
  };
}

export function initializePolicyModel(sequelize: Sequelize): typeof Policy {
  Policy.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id'
    },
    policy_type: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'policy_type'
    },
    policy_number: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'policy_number'
    },
    insurer: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'insurer'
    },
    policy_comment: {
      type: DataTypes.TEXT,
      field: 'policy_comment'
    },
    start_date: {
      type: DataTypes.DATE,
      field: 'start_date'
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    automatic_renewal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'automatic_renewal'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by'
    },
    premium: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'premium'
    },
    payment_frequency: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'payment_frequency'
    },
    agent: {
      type: DataTypes.STRING,
      field: 'agent'
    },
    claims: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      field: 'claims'
    },
    deleted_at: {
      type: DataTypes.DATE,
      field: 'deleted_at'
    }
  }, {
    sequelize,
    modelName: 'Policy',
    tableName: 'policies',
    underscored: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  // Define associations
  Policy.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'user'
  });

  return Policy;
}