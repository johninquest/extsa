// src/modules/policy/policy.routes.ts
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import Policy from './policy.model';
import { validatePolicy, validatePolicyUpdate } from './policy.validator';
import { authLimiter } from '../auth/auth.middleware';
import { verifyFirebaseToken } from '../../config/firebase';
import policyMiddleware from './policy.middleware';
import Logger from '../../config/logger';
import { asyncHandler } from '../../utils/asyncHandler' // Import the async handler wrapper

const router = express.Router();

// Apply rate limiting
router.use(authLimiter);

// This wrapper is needed to prevent TypeScript errors with the middleware
const authWrapper = (req: any, res: any, next: any) => {
  verifyFirebaseToken(req, res, next);
};

// Apply Firebase authentication
router.use(authWrapper);

/**
 * @route GET /api/policies
 * @desc Get all policies for the authenticated user
 * @access Private
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.email) {
    Logger.warn(`Unauthorized access attempt to list policies`, {
      ip: req.ip,
      method: 'GET',
      url: req.originalUrl
    });
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const policies = await Policy.findAll({
    where: { created_by: req.user.email },
    order: [['updated', 'DESC']]
  });

  Logger.info(`Policies retrieved successfully for user ${req.user.email}`, {
    count: policies.length,
    method: 'GET',
    url: req.originalUrl,
    user: req.user.email
  });

  return res.status(200).json({
    success: true,
    count: policies.length,
    data: policies
  });
}));

// Type-safe middleware wrapper for ownership check
const ownershipCheck = (req: any, res: any, next: any) => {
  policyMiddleware.checkPolicyOwnership(req, res, next);
};

// Type-safe middleware wrapper for ID validation
const idValidation = (req: any, res: any, next: any) => {
  policyMiddleware.validatePolicyId(req, res, next);
};

/**
 * @route GET /api/policies/:id
 * @desc Get a single policy by ID
 * @access Private
 */
router.get('/:id', idValidation, ownershipCheck, asyncHandler(async (req: Request, res: Response) => {
  Logger.info(`Policy retrieved successfully`, {
    policyId: req.params.id,
    method: 'GET',
    url: req.originalUrl,
    user: req.user?.email
  });

  return res.status(200).json({
    success: true,
    data: req.policy
  });
}));

/**
 * @route POST /api/policies
 * @desc Create a new policy
 * @access Private
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.email) {
    Logger.warn(`Unauthorized access attempt to create policy`, {
      ip: req.ip,
      method: 'POST', 
      url: req.originalUrl
    });
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  } 

  // Add this line to set created_by BEFORE validation
  req.body.created_by = req.user.email;

  // Validate the request body
  const { error, value } = validatePolicy(req.body);

  if (error) {
    Logger.warn(`Policy validation failed`, {
      errors: error.details.map(detail => detail.message), 
      method: 'POST',
      url: req.originalUrl,
      user: req.user.email,
      payload: JSON.stringify(req.body).substring(0, 200) // Log partial payload for debugging
    });
    return res.status(400).json({
      success: false,
      error: error.details.map(detail => detail.message)
    });
  }

  // Set the created_by field to the authenticated user's email
  value.created_by = req.user.email;

  // Create the policy
  const policy = await Policy.create(value);

  Logger.info(`Policy created successfully`, {
    policyId: policy.id, 
    policyType: policy.policy_type,
    method: 'POST',
    url: req.originalUrl,
    user: req.user.email
  });

  return res.status(201).json({
    success: true,
    data: policy
  });
}));

/**
 * @route PUT /api/policies/:id
 * @desc Update a policy
 * @access Private
 */
router.put('/:id', idValidation, ownershipCheck, asyncHandler(async (req: Request, res: Response) => {
  // Validate the update data
  const { error, value } = validatePolicyUpdate(req.body);

  if (error) {
    Logger.warn(`Policy update validation failed`, {
      policyId: req.params.id,
      errors: error.details.map(detail => detail.message),
      method: 'PUT',
      url: req.originalUrl,
      user: req.user?.email,
      payload: JSON.stringify(req.body).substring(0, 200)
    });
    return res.status(400).json({
      success: false,
      error: error.details.map(detail => detail.message)
    });
  }

  // Prevent changing the created_by field
  if (value.created_by && value.created_by !== req.user?.email) {
    Logger.warn(`Attempt to change policy ownership prevented`, {
      policyId: req.params.id,
      originalOwner: req.user?.email,
      attemptedOwner: value.created_by,
      method: 'PUT',
      url: req.originalUrl
    });
    return res.status(403).json({
      success: false,
      error: 'You cannot change the owner of a policy'
    });
  }

  // Update the policy
  await req.policy.update(value);

  Logger.info(`Policy updated successfully`, {
    policyId: req.params.id,
    policyType: req.policy.policy_type,
    method: 'PUT',
    url: req.originalUrl,
    user: req.user?.email,
    changedFields: Object.keys(value).join(', ')
  });

  return res.status(200).json({
    success: true,
    data: req.policy
  });
}));

/**
 * @route DELETE /api/policies/:id
 * @desc Delete a policy
 * @access Private
 */
router.delete('/:id', idValidation, ownershipCheck, asyncHandler(async (req: Request, res: Response) => {
  // Store policy info before deletion for logging
  const policyInfo = {
    id: req.policy.id,
    type: req.policy.policy_type,
    number: req.policy.policy_number
  };

  // Delete the policy
  await req.policy.destroy();

  Logger.info(`Policy deleted successfully`, {
    policyId: policyInfo.id,
    policyType: policyInfo.type,
    policyNumber: policyInfo.number,
    method: 'DELETE',
    url: req.originalUrl,
    user: req.user?.email
  });

  return res.status(200).json({
    success: true,
    data: {}
  });
}));

export default router;