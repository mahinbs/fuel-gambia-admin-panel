import api from './api';
import { BeneficiaryAllocation, ApiResponse, PaginatedResponse } from '@/types';

export const allocationService = {
  async getAllocations(params?: { beneficiaryId?: string; departmentId?: string }): Promise<PaginatedResponse<BeneficiaryAllocation>> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [],
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        });
      }, 500);
    });
  },

  async getAllocation(id: string): Promise<BeneficiaryAllocation> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as BeneficiaryAllocation);
      }, 500);
    });
  },

  async createAllocation(allocation: Partial<BeneficiaryAllocation>): Promise<BeneficiaryAllocation> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as BeneficiaryAllocation);
      }, 500);
    });
  },

  async updateAllocation(id: string, allocation: Partial<BeneficiaryAllocation>): Promise<BeneficiaryAllocation> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as BeneficiaryAllocation);
      }, 500);
    });
  },

  async suspendAllocation(id: string): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },
};
