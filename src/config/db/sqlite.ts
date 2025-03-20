import { Sequelize } from 'sequelize';
import Logger from '../logger'; // Adjust the import path as needed
import path from 'path';

// Path to the SQLite database file
const dbPath = path.resolve(__dirname, '../../sqlite.db');

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false // Set to true or a custom function if you want logging
});

// Export the sequelize instance before importing models
export default sequelize;

// Import models
import User from '../../modules/user/user.model'; 
import Policy from '../../modules/policy/policy.model';

// Test the connection and initialize models
export const initializeDatabase = async (): Promise<Sequelize> => {
  try {
    await sequelize.authenticate();
    Logger.info('Database connection established successfully.');
    
    // Sync models (creates tables if they don't exist)
    await User.sync();
    Logger.info('User model synchronized successfully.');
    await Policy.sync();
    Logger.info('Policy model synchronized successfully.');
    
    return sequelize;
  } catch (error) {
    Logger.error('Unable to connect to the database:', error);
    throw error;
  }
};