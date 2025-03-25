// src/modules/policy/policy.model.ts
import { customAlphabet } from 'nanoid';

// Custom ID generation
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const generateId = customAlphabet(alphabet, 21);

// Type definitions for policy
export interface PolicyInterface {
  id: string;
  policyType: string;
  policyNumber: string;
  insuranceProvider: string;
  policyComment?: string | null;
  startDate?: Date | null;
  endDate: Date;
  automaticRenewal: boolean;
  createdBy: string;
  premium: number;
  paymentFrequency: number;
  agent?: string | null;
  claims: string[]; // We'll handle conversion to/from JSON string
  deletedAt?: Date | null;
  created: Date;
  updated: Date;
}

// Interface for policy creation
export interface PolicyCreateInput {
  policyType: string;
  policyNumber: string;
  insuranceProvider: string;
  policyComment?: string | null;
  startDate?: Date | null;
  endDate: Date;
  automaticRenewal?: boolean;
  createdBy: string;
  premium: number;
  paymentFrequency: number;
  agent?: string | null;
  claims?: string[];
}

// Interface for policy updates
export interface PolicyUpdateInput {
  policyType?: string;
  policyNumber?: string;
  insuranceProvider?: string;
  policyComment?: string | null;
  startDate?: Date | null;
  endDate?: Date;
  automaticRenewal?: boolean;
  premium?: number;
  paymentFrequency?: number;
  agent?: string | null;
  claims?: string[];
}

// Helper functions to convert between claims array and JSON string
export const stringifyClaims = (claims: string[] = []): string => {
  return JSON.stringify(claims);
};

export const parseClaims = (claimsJson: string): string[] => {
  try {
    const parsed = JSON.parse(claimsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};