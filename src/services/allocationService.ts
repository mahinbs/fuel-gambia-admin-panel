import { allocationFunctions } from '@/supabase';
import { CouponAllocation, PaginatedResponse } from '@/types';

export const allocationService = {
  async getAllocations(params?: {
    beneficiaryId?: string;
    departmentId?: string;
    status?: string;
    page?: number;
  }): Promise<PaginatedResponse<CouponAllocation>> {
    const result = await allocationFunctions.getAllocations({
      beneficiaryId: params?.beneficiaryId,
      status: params?.status,
      page: params?.page,
    });

    return {
      data: (result.data || []).map((item: any) => ({
        id: item.id,
        beneficiaryId: item.beneficiary_id,
        allocatedBy: item.allocated_by,
        fuelType: item.fuel_type,
        allocatedLiters: Number(item.allocated_liters),
        usedLiters: Number(item.used_liters),
        remainingLiters: Number(item.remaining_liters),
        pricePerLiter: Number(item.price_per_liter),
        totalValue: Number(item.total_value),
        validFrom: item.valid_from,
        validUntil: item.valid_until,
        status: item.status,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })) as CouponAllocation[],
      total: result.total,
      page: result.page,
      limit: 20,
      totalPages: result.totalPages,
    };
  },

  async getAllocation(id: string): Promise<CouponAllocation> {
    // Fetch single allocation
    const result = await allocationFunctions.getAllocations({ page: 1 });
    const item = result.data.find((a: any) => a.id === id) as any;
    if (!item) throw new Error('Allocation not found');
    return item as CouponAllocation;
  },

  async createAllocation(allocation: {
    beneficiaryId: string;
    fuelType: 'PETROL' | 'DIESEL';
    allocatedLiters: number;
    pricePerLiter: number;
    validFrom: string;
    validUntil: string;
    notes?: string;
  }): Promise<CouponAllocation> {
    const data = await allocationFunctions.createAllocation(allocation);
    return {
      id: data.id,
      beneficiaryId: data.beneficiary_id,
      fuelType: data.fuel_type,
      allocatedLiters: Number(data.allocated_liters),
      usedLiters: Number(data.used_liters || 0),
      remainingLiters: Number(data.allocated_liters),
      pricePerLiter: Number(data.price_per_liter),
      totalValue: Number(data.total_value || 0),
      validFrom: data.valid_from,
      validUntil: data.valid_until,
      status: data.status,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as CouponAllocation;
  },

  async updateAllocation(id: string, allocation: Partial<CouponAllocation>): Promise<CouponAllocation> {
    // Use cancelAllocation + recreate pattern, or extend allocationFunctions if needed
    const data = await allocationFunctions.cancelAllocation(id);
    return data as unknown as CouponAllocation;
  },

  async suspendAllocation(id: string): Promise<void> {
    await allocationFunctions.cancelAllocation(id);
  },
};
