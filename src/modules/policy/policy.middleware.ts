import { Request, Response, NextFunction } from 'express';
import policyModel, { Policy } from './policy.model';
import Logger from '../../config/logger';
import { FirebaseUser } from '../../config/firebase'; // Import the FirebaseUser type

// Extend the Express Request interface to include policy WITHOUT redefining user
declare global {
  namespace Express {
    interface Request {
      policy?: Policy; // Only add policy, not user
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
    return; // Return without calling next()
  }
  
  // If validation passes, proceed to next middleware
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
      return; // Return without calling next()
    }

    // Ensure user is authenticated and has an email
    if (!req.user?.email) {
      res.status(401).json({
        success: false,
        error: 'Authentication required to access this policy'
      });
      return; // Return without calling next()
    }

    const policy = await policyModel.findById(policyId);

    if (!policy || policy.created_by !== req.user.email) {
      res.status(404).json({
        success: false,
        error: 'Policy not found or you do not have permission to access it'
      });
      return; // Return without calling next()
    }

    req.policy = policy;
    next();
  } catch (error) {
    Logger.error(`Error checking policy ownership for ID ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
    // No need to return here as this is the last statement
  }
};

export default {
  validatePolicyId,
  checkPolicyOwnership,
  ensurePolicyExists
};