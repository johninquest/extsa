// src/modules/policy/policy.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Logger from '../../config/logger';
import { Policy } from './policy.model';
import { User } from '../user/user.model';

// Extend the Express Request interface to include policy
declare global {
  namespace Express {
    interface Request {
      policy?: Policy;
    }
  }
}

// Type guard function to ensure policy exists
export function ensurePolicyExists(req: Request): asserts req is Request & { policy: Policy } {
  if (!req.policy) {
    throw new Error('Policy not found on request object');
  }
}

/**
 * Middleware to validate policy IDs
 */
export const validatePolicyId = (req: Request, res: Response, next: NextFunction): void => {
  const policyId = req.params.id;
  
  if (!policyId) {
    res.status(400).json({
      success: false,
      error: 'Policy ID is required'
    });
    return;
  }
  
  next();
};

/**
 * Middleware to check if the policy exists and belongs to the requesting user
 */
export const checkPolicyOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const policyId = req.params.id;
    
    if (!policyId) {
      res.status(400).json({
        success: false,
        error: 'Policy ID is required'
      });
      return;
    }
   
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        error: 'Authentication required to access this policy'
      });
      return;
    }
   
    const policy = await Policy.findOne({
      where: { id: policyId },
      include: [{ 
        model: User, 
        as: 'user',
        required: true // Ensures the user exists
      }]
    });
    
    if (!policy) {
      res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
      return;
    }

    // Type assertion to access the associated user
    const policyOwnerEmail = (policy.user as User).email;
    
    if (policyOwnerEmail !== req.user.email) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to access this policy'
      });
      return;
    }

    req.policy = policy;
    next();
  } catch (error) {
    Logger.error(`Error checking policy ownership for ID ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export default {
  validatePolicyId,
  checkPolicyOwnership,
  ensurePolicyExists
};