import { createClient } from '@/utils/supabase/client';
import { Beneficiary, PaginatedResponse, VerificationStatus, FuelType } from '@/types';
import { PAGE_SIZE } from '@/utils/constants';

const supabase = createClient();

export const beneficiariesService = {
  async getBeneficiaries(params: {
    page?: number;
    search?: string;
    status?: string;
    department?: string;
  }): Promise<PaginatedResponse<Beneficiary>> {
    const page = params.page || 1;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('profiles')
      .select(`
        *,
        beneficiary:beneficiaries!beneficiaries_id_fkey(*, department:departments(name))
      `, { count: 'exact' })
      .eq('role', 'BENEFICIARY');

    if (params.search) {
      query = query.or(`name.ilike.%${params.search}%,phone_number.ilike.%${params.search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    const formattedData: Beneficiary[] = (data || []).map(item => {
      const rawB = (item as any).beneficiary;
      const b = Array.isArray(rawB) ? rawB[0] : rawB;
      return {
        id: item.id,
        phoneNumber: item.phone_number,
        role: item.role as any,
        name: item.name,
        email: item.email,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        governmentId: b?.government_id,
        departmentName: b?.department?.name,
        verificationStatus: b?.verification_status as VerificationStatus,
        monthlyAllocation: Number(b?.monthly_allocation || 0),
        remainingBalance: Number(b?.remaining_balance || 0),
        fuelType: b?.fuel_type as FuelType,
        expiryDate: b?.expiry_date,
      };
    });

    return {
      data: formattedData,
      total: count || 0,
      page,
      limit: PAGE_SIZE,
      totalPages: Math.ceil((count || 0) / PAGE_SIZE),
    };
  },

  async getBeneficiaryById(id: string): Promise<Beneficiary> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        beneficiary:beneficiaries!beneficiaries_id_fkey(*, department:departments(name))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    const rawB = (data as any).beneficiary;
    const b = Array.isArray(rawB) ? rawB[0] : rawB;
    return {
      id: data.id,
      phoneNumber: data.phone_number,
      role: data.role as any,
      name: data.name,
      email: data.email,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      governmentId: b?.government_id,
      departmentName: b?.department?.name,
      verificationStatus: b?.verification_status as VerificationStatus,
      monthlyAllocation: Number(b?.monthly_allocation || 0),
      remainingBalance: Number(b?.remaining_balance || 0),
      fuelType: b?.fuel_type as FuelType,
      expiryDate: b?.expiry_date,
    };
  },

  async verifyBeneficiary(id: string, status: string, rejectionReason?: string): Promise<Beneficiary> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .upsert({
        id,
        verification_status: status,
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Also update profiles table is_verified and kyc_status columns
    await supabase
      .from('profiles')
      .update({
        is_verified: status === 'APPROVED',
        kyc_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    return this.getBeneficiaryById(id);
  },

  async updateAllocation(id: string, monthlyAllocation: number, fuelType: string): Promise<Beneficiary> {
    const { data, error } = await supabase
      .from('beneficiaries')
      .update({
        monthly_allocation: monthlyAllocation,
        fuel_type: fuelType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.getBeneficiaryById(id);
  },
};
