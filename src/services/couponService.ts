import { couponFunctions } from '@/supabase';
import { Coupon, PaginatedResponse } from '@/types';

export const couponService = {
  async getCoupons(params?: {
    status?: string;
    beneficiaryId?: string;
    page?: number;
  }): Promise<PaginatedResponse<Coupon>> {
    const result = await couponFunctions.getCoupons({
      status: params?.status,
      beneficiaryId: params?.beneficiaryId,
      page: params?.page,
    });

    return {
      data: (result.data || []).map((item: any) => ({
        id: item.id,
        allocationId: item.allocation_id,
        beneficiaryId: item.beneficiary_id,
        beneficiaryName: item.beneficiary?.name || 'Unknown',
        fuelType: item.fuel_type,
        amount: Number(item.amount),
        liters: Number(item.liters),
        qrPayload: item.qr_payload,
        status: item.status,
        usedAt: item.used_at,
        usedAtStation: item.station?.name,
        expiresAt: item.expires_at,
        createdAt: item.created_at,
      })) as Coupon[],
      total: result.total,
      page: result.page,
      limit: 20,
      totalPages: result.totalPages,
    };
  },

  async getCoupon(id: string): Promise<Coupon> {
    const result = await couponFunctions.getCoupons({ page: 1 });
    const item = result.data.find((c: any) => c.id === id) as any;
    if (!item) throw new Error('Coupon not found');
    return item as Coupon;
  },

  async issueCoupon(
    beneficiaryId: string,
    amount: number,
    liters: number,
    options: {
      allocationId?: string;
      fuelType?: 'PETROL' | 'DIESEL';
      expiresAt?: string;
    } = {}
  ): Promise<Coupon> {
    const data = await couponFunctions.issueCoupon({
      allocationId: options.allocationId || '',
      beneficiaryId,
      fuelType: options.fuelType || 'PETROL',
      amount,
      liters,
      expiresAt: options.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }) as any;

    return {
      id: data.id,
      beneficiaryId: data.beneficiary_id,
      fuelType: data.fuel_type,
      amount: Number(data.amount),
      liters: Number(data.liters),
      qrPayload: data.qr_payload,
      status: data.status,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    } as Coupon;
  },

  async expireCoupon(id: string): Promise<void> {
    await couponFunctions.expireCoupon(id);
  },

  async cancelCoupon(id: string): Promise<void> {
    await couponFunctions.cancelCoupon(id);
  },

  /** Validate and atomically redeem a QR coupon */
  async validateAndRedeem(payload: {
    qrPayload: string;
    stationId: string;
    attendantId: string;
    liters: number;
  }) {
    return await couponFunctions.validateAndRedeem(payload);
  },
};
