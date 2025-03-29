import { WhereOptions, Op, Transaction } from 'sequelize'; 
import { User } from '../user/user.model';
import { Policy } from './policy.model';
import Logger from '../../config/logger';

export class PolicyRepository {
  async findByCreator(email: string) {
    try {
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return [];
      }

      return Policy.findAll({
        where: { 
          createdBy: user.id,
          deletedAt: null 
        }
      });
    } catch (error) {
      Logger.error('Error in findByCreator', { email, error });
      throw error;
    }
  }

  async findById(id: string) {
    try {
      return Policy.findByPk(id);
    } catch (error) {
      Logger.error('Error in findById', { id, error });
      throw error;
    }
  }

  async create(policyData: any, transaction?: Transaction) {
    try {
      return Policy.create(policyData, { transaction });
    } catch (error) {
      Logger.error('Error creating policy', { policyData, error });
      throw error;
    }
  }

  async update(id: string, updateData: any, transaction?: Transaction) {
    try {
      const [updatedRowsCount, updatedRows] = await Policy.update(
        updateData, 
        { 
          where: { id },
          returning: true,
          transaction
        }
      );

      return updatedRows[0];
    } catch (error) {
      Logger.error('Error updating policy', { id, updateData, error });
      throw error;
    }
  }

  async softDelete(id: string, transaction?: Transaction) {
    try {
      return Policy.destroy({ 
        where: { id },
        transaction
      });
    } catch (error) {
      Logger.error('Error soft deleting policy', { id, error });
      throw error;
    }
  }

  async restore(id: string, transaction?: Transaction) {
    try {
      return this.update(id, { deletedAt: null }, transaction);
    } catch (error) {
      Logger.error('Error restoring policy', { id, error });
      throw error;
    }
  }
}

export default new PolicyRepository();