import { adminUserFunctions } from '@/supabase';
import { AdminUser, AdminRole } from '@/types';

export const profilesService = {
  async getAdminProfiles(): Promise<AdminUser[]> {
    const data = await adminUserFunctions.getAdminProfiles();
    return (data || []).map((item: any) => ({
      id: item.id,
      email: item.email || '',
      name: item.name || '',
      role: item.role as AdminRole,
      permissions: [],
      createdAt: item.created_at,
      active: item.is_active ?? true,
      kycStatus: (item.kyc_status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
      companyName: item.company_name || undefined,
      departmentName: item.department_name || undefined,
      stationName: item.station_name || undefined,
      phoneNumber: item.phone_number || undefined,
    }));
  },

  async updateKycStatus(userId: string, kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<AdminUser> {
    const item = await adminUserFunctions.updateKycStatus(userId, kycStatus);
    return {
      id: item.id,
      email: item.email || '',
      name: item.name || '',
      role: item.role as AdminRole,
      permissions: [],
      createdAt: item.created_at,
      active: item.is_active ?? true,
      kycStatus: (item.kyc_status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
      companyName: item.company_name || undefined,
      departmentName: item.department_name || undefined,
      stationName: item.station_name || undefined,
      phoneNumber: item.phone_number || undefined,
    };
  },

  async toggleUserActive(userId: string, isActive: boolean): Promise<AdminUser> {
    const item = await adminUserFunctions.toggleUserActive(userId, isActive);
    return {
      id: item.id,
      email: item.email || '',
      name: item.name || '',
      role: item.role as AdminRole,
      permissions: [],
      createdAt: item.created_at,
      active: item.is_active ?? true,
      kycStatus: (item.kyc_status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
      companyName: item.company_name || undefined,
      departmentName: item.department_name || undefined,
      stationName: item.station_name || undefined,
      phoneNumber: item.phone_number || undefined,
    };
  },

  async deleteUserProfile(userId: string): Promise<void> {
    await adminUserFunctions.deleteUserProfile(userId);
  },
};
