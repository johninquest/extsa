// src/modules/policy/policy.validator.ts
import Joi from 'joi';

// Schema with only camelCase fields
const policySchema = Joi.object({
  id: Joi.string().length(21).optional(),
  policyType: Joi.string().required(),
  policyNumber: Joi.string().required(),
  insuranceProvider: Joi.string().required(),
  policyComment: Joi.string().optional().allow(null, ''),
  startDate: Joi.date().optional().allow(null),
  endDate: Joi.date().required(),
  automaticRenewal: Joi.boolean().default(false),
  createdBy: Joi.string().required(),
  premium: Joi.number().required().min(0),
  paymentFrequency: Joi.number().integer().required().min(0),
  agent: Joi.string().optional().allow(null, ''),
  claims: Joi.array().items(Joi.string()).optional().default([]),
  deletedAt: Joi.date().optional().allow(null),
  created: Joi.date().optional(),
  updated: Joi.date().optional(),
});

export const validatePolicy = (policy: any) => {
  // Just directly validate with no conversions
  return policySchema.validate(policy, { abortEarly: false });
};

export const validatePolicyUpdate = (policy: any) => {
  const updateSchema = policySchema.fork(
    [
      'policyType', 
      'policyNumber', 
      'insuranceProvider',
      'endDate',
      'createdBy',
      'premium',
      'paymentFrequency'
    ], 
    (schema) => schema.optional()
  );
  
  return updateSchema.validate(policy, { abortEarly: false });
};

export const validatePolicyDelete = (policy: any) => {
  const deleteSchema = Joi.object({
    deletedAt: Joi.date().required()
  });
  
  return deleteSchema.validate(policy, { abortEarly: false });
};