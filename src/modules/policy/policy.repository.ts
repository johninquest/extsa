// src/modules/policy/policy.repository.ts
import prisma from '../../config/db/prisma';
import { 
  generateId, 
  PolicyInterface, 
  PolicyCreateInput, 
  PolicyUpdateInput, 
  stringifyClaims, 
  parseClaims 
} from './policy.model';

// Type for the policy with parsed claims
interface PolicyWithParsedClaims extends Omit<PolicyInterface, 'claims'> {
  claims: string[];
}

// Helper function to convert a Prisma policy to one with parsed claims
const convertPolicy = (policy: any): PolicyWithParsedClaims => {
  return {
    ...policy,
    claims: parseClaims(policy.claims)
  };
};

export const PolicyRepository = {
  /**
   * Create a new policy
   */
  create: async (data: PolicyCreateInput): Promise<PolicyWithParsedClaims> => {
    const policy = await prisma.policy.create({
      data: {
        id: generateId(),
        policyType: data.policyType,
        policyNumber: data.policyNumber,
        insuranceProvider: data.insuranceProvider,
        policyComment: data.policyComment,
        startDate: data.startDate,
        endDate: data.endDate,
        automaticRenewal: data.automaticRenewal ?? false,
        createdBy: data.createdBy,
        premium: data.premium,
        paymentFrequency: data.paymentFrequency,
        agent: data.agent,
        claims: stringifyClaims(data.claims)
      }
    });

    return convertPolicy(policy);
  },

  /**
   * Find all policies by user email
   */
  findByUserEmail: async (email: string, includeDeleted: boolean = false): Promise<PolicyWithParsedClaims[]> => {
    const policies = await prisma.policy.findMany({
      where: {
        createdBy: email,
        ...(includeDeleted ? {} : { deletedAt: null })
      },
      orderBy: {
        updated: 'desc'
      }
    });

    return policies.map((policy: any) => convertPolicy(policy));
  },

  /**
   * Find policy by ID and user email
   */
  findByIdAndEmail: async (id: string, email: string): Promise<PolicyWithParsedClaims | null> => {
    const policy = await prisma.policy.findFirst({
      where: {
        id,
        createdBy: email
      }
    });

    if (!policy) return null;

    return convertPolicy(policy);
  },

  /**
   * Update a policy
   */
  update: async (id: string, data: PolicyUpdateInput): Promise<PolicyWithParsedClaims> => {
    // If claims array is provided, convert to JSON string
    const updateData: any = { ...data };
    if (updateData.claims) {
      updateData.claims = stringifyClaims(updateData.claims);
    }

    const policy = await prisma.policy.update({
      where: { id },
      data: updateData
    });

    return convertPolicy(policy);
  },

  /**
   * Soft delete a policy
   */
  softDelete: async (id: string): Promise<PolicyWithParsedClaims> => {
    const policy = await prisma.policy.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return convertPolicy(policy);
  },

  /**
   * Restore a soft-deleted policy
   */
  restore: async (id: string): Promise<PolicyWithParsedClaims> => {
    const policy = await prisma.policy.update({
      where: { id },
      data: { deletedAt: null }
    });

    return convertPolicy(policy);
  }
};

export default PolicyRepository;