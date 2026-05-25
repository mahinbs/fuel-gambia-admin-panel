import { policyFunctions } from '@/supabase';
import { FuelPolicy, PolicyVersion, PaginatedResponse } from '@/types';

export const policyService = {
  async getPolicies(params: { isActive?: boolean; policyType?: string } = {}): Promise<FuelPolicy[]> {
    const data = await policyFunctions.getPolicies(params);
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      policyType: item.policy_type,
      value: item.value ? Number(item.value) : undefined,
      fuelType: item.fuel_type,
      effectiveFrom: item.effective_from,
      effectiveTo: item.effective_to,
      isActive: item.is_active,
      createdBy: item.created_by_profile?.name || 'Unknown',
      version: item.version,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) as FuelPolicy[];
  },

  async getPolicy(id: string): Promise<FuelPolicy> {
    const item = await policyFunctions.getPolicyById(id);
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      policyType: item.policy_type,
      value: item.value ? Number(item.value) : undefined,
      fuelType: item.fuel_type,
      effectiveFrom: item.effective_from,
      effectiveTo: item.effective_to,
      isActive: item.is_active,
      version: item.version,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    } as FuelPolicy;
  },

  async createPolicy(policy: {
    title: string;
    description?: string;
    policyType: string;
    value?: number;
    fuelType?: string;
    effectiveFrom: string;
    effectiveTo?: string;
  }): Promise<FuelPolicy> {
    const data = await policyFunctions.createPolicy({
      title: policy.title,
      description: policy.description,
      policyType: policy.policyType,
      value: policy.value,
      fuelType: policy.fuelType,
      effectiveFrom: policy.effectiveFrom,
      effectiveTo: policy.effectiveTo,
    }) as any;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      policyType: data.policy_type,
      value: data.value ? Number(data.value) : undefined,
      fuelType: data.fuel_type,
      effectiveFrom: data.effective_from,
      effectiveTo: data.effective_to,
      isActive: data.is_active,
      version: data.version,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as FuelPolicy;
  },

  async updatePolicy(id: string, policy: Partial<FuelPolicy>): Promise<FuelPolicy> {
    const data = await policyFunctions.updatePolicy(id, {
      title: policy.title,
      description: policy.description,
      value: policy.value,
      is_active: policy.isActive,
      effective_to: policy.effectiveTo,
    } as any) as any;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      policyType: data.policy_type,
      value: data.value ? Number(data.value) : undefined,
      fuelType: data.fuel_type,
      effectiveFrom: data.effective_from,
      effectiveTo: data.effective_to,
      isActive: data.is_active,
      version: data.version,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as FuelPolicy;
  },

  async deletePolicy(id: string): Promise<void> {
    await policyFunctions.deactivatePolicy(id);
  },

  async getPolicyHistory(id: string): Promise<PolicyVersion[]> {
    // Policy versioning is tracked via the version field + audit_logs
    // Return empty array — full version history requires audit log integration
    return [];
  },
};
