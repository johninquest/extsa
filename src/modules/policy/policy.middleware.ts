// src/modules/policy/policy.middleware.ts
import { Request, Response, NextFunction } from 'express';
import PolicyRepository from './policy.repository';
import Logger from '../../config/logger';

// Extend the Express Request interface to include policy
declare global {
  namespace Express {
    interface Request {
      policy?: any; // Ideally this would be more strongly typed
    }
  }
}

/**
 * Middleware to validate policy IDs
 */
export const validatePolicyId = (req: Request, res: Response, next: NextFunction) => {
  const policyId = req.params.id;
  
  if (!policyId) {
    return res.status(400).json({
      success: false,
      error: 'Policy ID is required'
    });
  }
  
  // You could add additional validation here if needed
  // For example, checking if the ID matches your expected format with a regex
  
  next();
};

/**
 * Middleware to check if the policy exists and belongs to the requesting user
 */
export const checkPolicyOwnership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policyId = req.params.id;
    
    // This should be redundant if validatePolicyId is used before this middleware
    if (!policyId) {
      return res.status(400).json({
        success: false,
        error: 'Policy ID is required'
      });
    }
    
    // Ensure user is authenticated and has an email
    if (!req.user?.email) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required to access this policy'
      });
    }
    
    const policy = await PolicyRepository.findByIdAndEmail(policyId, req.user.email);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found or you do not have permission to access it'
      });
    }
    
    // Attach the policy to the request object for use in route handlers
    req.policy = policy;
    next();
  } catch (error) {
    Logger.error(`Error checking policy ownership for ID ${req.params.id}`, error);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

export default {
  validatePolicyId,
  checkPolicyOwnership
};