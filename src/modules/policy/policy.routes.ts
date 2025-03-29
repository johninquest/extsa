// src/modules/policy/policy.routes.ts
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { Policy } from "./policy.model";
import PolicyRepository from "./policy.repository";
import { validatePolicy, validatePolicyUpdate } from "./policy.validator";
import { authLimiter } from "../auth/auth.middleware";
import { verifyFirebaseToken } from "../../config/firebase";
import policyMiddleware, { ensurePolicyExists } from "./policy.middleware";
import Logger from "../../config/logger";
import { asyncHandler } from "../../utils/asyncHandler";
import { User } from "../user/user.model";

const router = express.Router();

// Apply rate limiting
router.use(authLimiter);

// This wrapper is needed to prevent TypeScript errors with the middleware
const authWrapper = (req: any, res: any, next: any) => {
  verifyFirebaseToken(req, res, next);
};

// Apply Firebase authentication
router.use(authWrapper);

// Define middleware variables for better readability
const idValidation = policyMiddleware.validatePolicyId;
const ownershipCheck = policyMiddleware.checkPolicyOwnership;

/**
 * @route GET /api/policies
 * @desc Get all policies for the authenticated user
 * @access Private
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.email) {
      Logger.warn(`Unauthorized access attempt to list policies`, {
        ip: req.ip,
        method: "GET",
        url: req.originalUrl,
      });
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Using PolicyRepository to find policies
    const policies = await PolicyRepository.findByCreator(req.user.email);

    Logger.info(`Policies retrieved successfully for user ${req.user.email}`, {
      count: policies.length,
      method: "GET",
      url: req.originalUrl,
      user: req.user.email,
    });

    return res.status(200).json({
      success: true,
      count: policies.length,
      data: policies,
    });
  })
);

// ... (rest of the routes remain similar, replacing Policy methods with PolicyRepository)

/**
 * @route POST /api/policies
 * @desc Create a new policy
 * @access Private
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.email) {
      Logger.warn(`Unauthorized access attempt to create policy`, {
        ip: req.ip,
        method: "POST",
        url: req.originalUrl,
      });
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Add this line to set created_by BEFORE validation
    req.body.created_by = req.user.email;

    // Validate the request body
    const { error, value } = validatePolicy(req.body);

    if (error) {
      Logger.warn(`Policy validation failed`, {
        errors: error.details.map((detail) => detail.message),
        method: "POST",
        url: req.originalUrl,
        user: req.user.email,
        payload: JSON.stringify(req.body).substring(0, 200),
      });
      return res.status(400).json({
        success: false,
        error: error.details.map((detail) => detail.message),
      });
    }

    // Find the user to get the actual user ID
    const user = await User.findOne({ where: { email: req.user.email } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Set the created_by field to the user's ID
    value.createdBy = user.id;
    
    // Convert string dates to Date objects if needed
    if (value.startDate && typeof value.startDate === 'string') {
      value.startDate = new Date(value.startDate);
    }
    if (value.endDate && typeof value.endDate === 'string') {
      value.endDate = new Date(value.endDate);
    }

    // Create the policy
    const policy = await PolicyRepository.create(value);

    Logger.info(`Policy created successfully`, {
      policyId: policy.id,
      policyType: policy.policy_type,
      method: "POST",
      url: req.originalUrl,
      user: req.user.email,
    });

    return res.status(201).json({
      success: true,
      data: policy,
    });
  })
);

// Similar adaptations for PUT, PATCH, DELETE routes...

export default router;