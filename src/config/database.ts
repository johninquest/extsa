// src/config/database.ts
import { Sequelize } from 'sequelize';
import Logger from './logger';
import { initializeUserModel } from '../modules/user/user.model';
import { initializePolicyModel } from '../modules/policy/policy.model';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'polisync',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS || 'postgres',
  {
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: (msg) => Logger.info(msg),
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

export async function initializeDatabase() {
  try {
    // Log connection details
    Logger.info('Database Connection Details:', {
      database: process.env.DB_NAME || 'polisync',
      host: process.env.DB_HOST || 'postgres',
      port: process.env.DB_PORT || '5432',
      user: process.env.DB_USER || 'postgres'
    });

    // Explicitly import and initialize models
    Logger.info('Initializing User Model');
    const User = initializeUserModel(sequelize);
    
    Logger.info('Initializing Policy Model');
    const Policy = initializePolicyModel(sequelize);

    // Debug: Log model information
    Logger.info('User Model:', {
      modelName: User.name,
      tableName: User.tableName,
      primaryKey: User.primaryKeyAttribute
    });

    Logger.info('Policy Model:', {
      modelName: Policy.name,
      tableName: Policy.tableName,
      primaryKey: Policy.primaryKeyAttribute
    });

    // Explicitly define associations with more robust configuration
    try {
      Logger.info('Defining Associations');
      
      // Explicitly check model existence before defining associations
      if (!User || !Policy) {
        throw new Error('User or Policy model is undefined');
      }

      Policy.belongsTo(User, {
        foreignKey: {
          name: 'created_by',
          allowNull: false,
          field: 'created_by'
        },
        as: 'user'
      });

      User.hasMany(Policy, {
        foreignKey: {
          name: 'created_by',
          allowNull: false,
          field: 'created_by'
        },
        as: 'policies'
      });

      Logger.info('Associations defined successfully');
    } catch (associationError) {
      Logger.error('Error defining associations:', associationError);
      throw associationError;
    }

    // Authenticate connection
    await sequelize.authenticate();
    Logger.info('Database connection established successfully.');

    // Sync models with more detailed logging
    try {
      await sequelize.sync({
        alter: process.env.NODE_ENV === 'development',
        logging: (msg) => Logger.info('Sync Log:', msg)
      });
    } catch (syncError) {
      Logger.error('Error during model synchronization:', syncError);
      throw syncError;
    }

    Logger.info('Database synchronized');
    return true;
  } catch (error) {
    Logger.error('Unable to connect to the database:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      Logger.error('Detailed Error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }

    return false;
  }
}

export default sequelize;