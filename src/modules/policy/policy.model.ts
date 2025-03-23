// src/modules/policy/policy.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { customAlphabet } from 'nanoid';
import sequelize from '../../config/db/sqlite'; // Adjust the import path as needed

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const generateId = customAlphabet(alphabet, 21);

interface PolicyAttributes {
  id: string;
  policy_type: string;
  policy_number: string;
  insurance_provider: string;
  policy_comment?: string;
  start_date?: Date;
  end_date: Date;
  automatic_renewal: boolean;
  created_by: string;
  premium: number;
  payment_frequency: number;
  agent?: string;
  claims: string[];
  created: Date;
  updated: Date;
}

interface PolicyCreationAttributes extends Optional<PolicyAttributes, 'id' | 'policy_comment' | 'start_date' | 'claims' | 'created' | 'updated'> {}

class Policy extends Model<PolicyAttributes, PolicyCreationAttributes> implements PolicyAttributes {
  public id!: string;
  public policy_type!: string;
  public policy_number!: string;
  public insurance_provider!: string;
  public policy_comment?: string;
  public start_date?: Date;
  public end_date!: Date;
  public automatic_renewal!: boolean;
  public created_by!: string;
  public premium!: number;
  public payment_frequency!: number;
  public agent?: string; // New field for agent - optional
  public claims!: string[]; // New field for array of claims
  public created!: Date;
  public updated!: Date;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Policy.init(
  {
    id: {
      type: DataTypes.STRING(21),
      primaryKey: true,
      defaultValue: () => generateId(),
    },
    policy_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    policy_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    insurance_provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    policy_comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    automatic_renewal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    premium: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    payment_frequency: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    agent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    claims: {
      type: DataTypes.JSON, // Using JSON type to store an array of strings
      allowNull: true,
      defaultValue: [], // Default to empty array
    },
    created: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize, // Pass the sequelize instance here
    tableName: 'policies',
    underscored: true,
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
  }
);

// You might want to add associations here
// For example, if policies belong to users:
// Policy.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
// Policy.belongsTo(Agent, { foreignKey: 'agent', as: 'agentRelation' });
// Policy.hasMany(Claim, { foreignKey: 'policy_id', as: 'claims' });

export default Policy;