import api from './api';
import { Coupon, ApiResponse, PaginatedResponse } from '@/types';

export const couponService = {
  async getCoupons(params?: { status?: string; beneficiaryId?: string }): Promise<PaginatedResponse<Coupon>> {
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

  async getCoupon(id: string): Promise<Coupon> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as Coupon);
      }, 500);
    });
  },

  async issueCoupon(beneficiaryId: string, amount: number, liters: number): Promise<Coupon> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({} as Coupon);
      }, 500);
    });
  },

  async expireCoupon(id: string): Promise<void> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },
};
