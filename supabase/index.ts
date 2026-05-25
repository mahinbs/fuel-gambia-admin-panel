/**
 * Fuel Gambia Admin Panel — Supabase Integration
 * 
 * This file exports all Supabase database functions for the admin panel.
 * Import from this file instead of writing raw Supabase queries in components.
 * 
 * Usage:
 *   import { authFunctions, stationFunctions, ... } from '@/supabase';
 */

import { createClient } from '@/utils/supabase/client';
import type {
  AdminUser,
  Station,
  Attendant,
  Beneficiary,
  Transaction,
  Payment,
  Coupon,
  FuelPolicy,
  StationOrder,
  FuelDelivery,
  Reconciliation,
  BillingRecord,
  CouponAllocation,
  Notification,
  Shift,
  MeterReading,
  AuditLog,
  Company,
  Department,
  PaginatedResponse,
  DashboardStats,
} from '@/types';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createClient();

export const createRegisterClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
};

// ─────────────────────────────────────────────
// AUTH FUNCTIONS
// ─────────────────────────────────────────────
export const authFunctions = {
  /** Sign in with email/password */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  /** Sign up a new admin user */
  async signUp(email: string, password: string, name: string, role: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw error;
    return data;
  },

  /** Sign out */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /** Get current session */
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /** Get current user's profile */
  async getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) throw error;
    return data;
  },

  /** Update profile */
  async updateProfile(id: string, updates: { name?: string; avatar_url?: string }) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// DASHBOARD FUNCTIONS
// ─────────────────────────────────────────────
export const dashboardFunctions = {
  /** Get role-specific dashboard stats via RPC (single round-trip) */
  async getStats(role: string): Promise<DashboardStats> {
    const { data, error } = await supabase.rpc('get_dashboard_stats', { p_role: role });
    if (error) throw error;
    return data as DashboardStats;
  },

  /** Monthly fuel usage trend (last 6 months) */
  async getMonthlyFuelTrend(stationId?: string) {
    let query = supabase
      .from('transactions')
      .select('fuel_type, liters, created_at, mode, amount')
      .eq('status', 'SUCCESS')
      .gte('created_at', new Date(Date.now() - 180 * 86400000).toISOString());
    if (stationId) query = query.eq('station_id', stationId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /** Station inventory levels */
  async getInventoryLevels() {
    const { data, error } = await supabase
      .from('stations')
      .select('id, name, petrol_stock, diesel_stock, low_stock_threshold, status')
      .eq('status', 'ACTIVE');
    if (error) throw error;
    return data || [];
  },
};

// ─────────────────────────────────────────────
// COMPANY FUNCTIONS (Super Admin)
// ─────────────────────────────────────────────
export const companyFunctions = {
  async getCompanies(params: { page?: number; search?: string; status?: string } = {}) {
    const page = params.page || 1;
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    let query = supabase.from('companies').select('*', { count: 'exact' });
    if (params.search) query = query.ilike('name', `%${params.search}%`);
    if (params.status) query = query.eq('status', params.status);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + pageSize - 1);
    if (error) throw error;
    return { data: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / pageSize) };
  },

  async createCompany(payload: Partial<Company>) {
    const { data, error } = await supabase.from('companies').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async updateCompany(id: string, updates: Partial<Company>) {
    const { data, error } = await supabase.from('companies').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteCompany(id: string) {
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─────────────────────────────────────────────
// STATION FUNCTIONS
// ─────────────────────────────────────────────
export const stationFunctions = {
  async getStations(params: { page?: number; search?: string; status?: string } = {}) {
    const page = params.page || 1;
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    let query = supabase.from('stations').select('*, company:companies(name), branch_manager:profiles!branch_manager_id(name)', { count: 'exact' });
    if (params.search) query = query.or(`name.ilike.%${params.search}%,location.ilike.%${params.search}%`);
    if (params.status) query = query.eq('status', params.status);
    const { data, count, error } = await query.order('name').range(from, from + pageSize - 1);
    if (error) throw error;
    const formattedData = (data || []).map((s: any) => ({
      ...s,
      manager_name: s.branch_manager?.name || null
    }));
    return { data: formattedData, total: count || 0, page, totalPages: Math.ceil((count || 0) / pageSize) };
  },

  async getStationById(id: string) {
    const { data, error } = await supabase
      .from('stations')
      .select('*, company:companies(name), branch_manager:profiles!branch_manager_id(name), pumps(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (data) {
      data.manager_name = data.branch_manager?.name || null;
    }
    return data;
  },

  async createStation(payload: any) {
    const { data, error } = await supabase.from('stations').insert({
      name: payload.name,
      station_code: payload.stationCode,
      location: payload.location,
      fuel_types: payload.fuelTypes,
      low_stock_threshold: payload.lowStockThreshold,
      status: payload.status || 'ACTIVE',
      total_capacity: payload.totalCapacity || 0,
      branch_manager_id: payload.branchManagerId || null,
    }).select().single();
    if (error) throw error;
    return data;
  },

  async updateStation(id: string, updates: any) {
    const { data, error } = await supabase.from('stations').update({
      name: updates.name,
      station_code: updates.stationCode,
      location: updates.location,
      fuel_types: updates.fuelTypes,
      low_stock_threshold: updates.lowStockThreshold,
      status: updates.status,
      petrol_stock: updates.petrolStock,
      diesel_stock: updates.dieselStock,
      total_capacity: updates.totalCapacity,
      branch_manager_id: updates.branchManagerId,
    }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async getLowStockStations() {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .or('petrol_stock.lt.low_stock_threshold,diesel_stock.lt.low_stock_threshold')
      .eq('status', 'ACTIVE');
    if (error) throw error;
    return data || [];
  },
};

// ─────────────────────────────────────────────
// INVENTORY FUNCTIONS
// ─────────────────────────────────────────────
export const inventoryFunctions = {
  /** Get inventory levels for all stations */
  async getInventories() {
    const { data, error } = await supabase
      .from('stations')
      .select('id, name, petrol_stock, diesel_stock, low_stock_threshold, updated_at, status')
      .order('name');
    if (error) throw error;
    return (data || []).map((s) => ({
      stationId: s.id,
      stationName: s.name,
      petrolStock: Number(s.petrol_stock),
      dieselStock: Number(s.diesel_stock),
      lowStockThreshold: Number(s.low_stock_threshold),
      lastUpdated: s.updated_at,
      status: s.status,
    }));
  },

  /** Get inventory for a single station */
  async getInventoryByStation(stationId: string) {
    const { data, error } = await supabase
      .from('stations')
      .select('id, name, petrol_stock, diesel_stock, low_stock_threshold, updated_at')
      .eq('id', stationId)
      .single();
    if (error) throw error;
    return data;
  },

  /** Update inventory stock (admin override) */
  async updateStock(stationId: string, fuelType: 'PETROL' | 'DIESEL', newQuantity: number) {
    const col = fuelType === 'PETROL' ? 'petrol_stock' : 'diesel_stock';
    const { data, error } = await supabase
      .from('stations')
      .update({ [col]: newQuantity })
      .eq('id', stationId)
      .select('id, name, petrol_stock, diesel_stock')
      .single();
    if (error) throw error;
    return data;
  },

  /** Get fuel delivery history for a station */
  async getDeliveries(stationId: string, params: { page?: number } = {}) {
    const page = params.page || 1;
    const from = (page - 1) * 20;
    const { data, count, error } = await supabase
      .from('fuel_deliveries')
      .select('*, received_by_profile:profiles!fuel_deliveries_received_by_fkey(name)', { count: 'exact' })
      .eq('station_id', stationId)
      .order('delivery_date', { ascending: false })
      .range(from, from + 19);
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  /** Process a new fuel delivery via RPC */
  async processDelivery(payload: {
    stationId: string;
    receivedBy: string;
    fuelType: 'PETROL' | 'DIESEL';
    orderedLiters: number;
    deliveredLiters: number;
    deliveryNote?: string;
    supplierName?: string;
  }) {
    const { data, error } = await supabase.rpc('process_fuel_delivery', {
      p_station_id: payload.stationId,
      p_received_by: payload.receivedBy,
      p_fuel_type: payload.fuelType,
      p_ordered_liters: payload.orderedLiters,
      p_delivered_liters: payload.deliveredLiters,
      p_delivery_note: payload.deliveryNote || null,
      p_supplier_name: payload.supplierName || null,
    });
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// BENEFICIARY FUNCTIONS (Government Admin)
// ─────────────────────────────────────────────
export const beneficiaryFunctions = {
  async getBeneficiaries(params: { page?: number; search?: string; status?: string; department?: string } = {}) {
    const page = params.page || 1;
    const from = (page - 1) * 20;
    let query = supabase
      .from('profiles')
      .select(`
        *,
        beneficiary:beneficiaries!beneficiaries_id_fkey(
          *, department:departments(name)
        )
      `, { count: 'exact' })
      .eq('role', 'BENEFICIARY');
    if (params.search) query = query.or(`name.ilike.%${params.search}%,phone_number.ilike.%${params.search}%`);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + 19);
    if (error) throw error;
    
    // Normalize beneficiary array to a single object
    const normalizedData = (data || []).map((p: any) => ({
      ...p,
      beneficiary: Array.isArray(p.beneficiary) ? p.beneficiary[0] || null : p.beneficiary || null
    }));

    return { data: normalizedData, total: count || 0, page, totalPages: Math.ceil((count || 0) / 20) };
  },

  async getBeneficiaryById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`*, beneficiary:beneficiaries!beneficiaries_id_fkey(*, department:departments(name))`)
      .eq('id', id)
      .single();
    if (error) throw error;
    
    if (data) {
      // Normalize beneficiary array to a single object
      data.beneficiary = Array.isArray(data.beneficiary) ? data.beneficiary[0] || null : data.beneficiary || null;
    }
    return data;
  },

  async verifyBeneficiary(id: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) {
    const { data, error } = await supabase
      .from('beneficiaries')
      .upsert({
        id,
        verification_status: status,
        rejection_reason: rejectionReason,
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        approved_at: new Date().toISOString(),
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

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action: status === 'APPROVED' ? 'VERIFY_BENEFICIARY_APPROVED' : 'VERIFY_BENEFICIARY_REJECTED',
      entity_type: 'beneficiaries',
      entity_id: id,
      new_values: { verification_status: status, rejection_reason: rejectionReason },
    });

    return data;
  },

  async updateAllocation(id: string, monthlyAllocation: number, fuelType: 'PETROL' | 'DIESEL') {
    const { data, error } = await supabase
      .from('beneficiaries')
      .update({ monthly_allocation: monthlyAllocation, fuel_type: fuelType, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBeneficiary(id: string, payload: {
    name: string;
    phone: string;
    governmentId: string;
    departmentId: string | null;
    monthlyAllocation: number;
  }) {
    // 1. Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        name: payload.name,
        phone_number: payload.phone || null,
        government_id: payload.governmentId,
        department_id: payload.departmentId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (profileError) throw profileError;

    // 2. Update beneficiaries table
    const { error: beneficiaryError } = await supabase
      .from('beneficiaries')
      .update({
        government_id: payload.governmentId,
        department_id: payload.departmentId || null,
        monthly_allocation: payload.monthlyAllocation,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (beneficiaryError) throw beneficiaryError;

    return { success: true };
  },

  async deleteBeneficiary(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};

// ─────────────────────────────────────────────
// COUPON ALLOCATION FUNCTIONS (Government Admin)
// ─────────────────────────────────────────────
export const allocationFunctions = {
  async getAllocations(params: { page?: number; beneficiaryId?: string; status?: string } = {}) {
    const page = params.page || 1;
    const from = (page - 1) * 20;
    let query = supabase
      .from('coupon_allocations')
      .select(`
        *,
        beneficiary:beneficiaries!coupon_allocations_beneficiary_id_fkey(
          id,
          profiles!beneficiaries_id_fkey(name, phone_number)
        )
      `, { count: 'exact' });
    if (params.beneficiaryId) query = query.eq('beneficiary_id', params.beneficiaryId);
    if (params.status) query = query.eq('status', params.status);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + 19);
    if (error) throw error;
    return { data: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / 20) };
  },

  async createAllocation(payload: {
    beneficiaryId: string;
    fuelType: 'PETROL' | 'DIESEL';
    allocatedLiters: number;
    pricePerLiter: number;
    validFrom: string;
    validUntil: string;
    notes?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('coupon_allocations')
      .insert({
        beneficiary_id: payload.beneficiaryId,
        allocated_by: user.user?.id,
        fuel_type: payload.fuelType,
        allocated_liters: payload.allocatedLiters,
        price_per_liter: payload.pricePerLiter,
        valid_from: payload.validFrom,
        valid_until: payload.validUntil,
        notes: payload.notes,
        status: 'ACTIVE',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async cancelAllocation(id: string) {
    const { data, error } = await supabase
      .from('coupon_allocations')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// COUPON FUNCTIONS
// ─────────────────────────────────────────────
export const couponFunctions = {
  async getCoupons(params: { page?: number; status?: string; beneficiaryId?: string } = {}) {
    const page = params.page || 1;
    const from = (page - 1) * 20;
    let query = supabase
      .from('coupons')
      .select(`
        *,
        beneficiary:profiles!coupons_beneficiary_id_fkey(name),
        station:stations!coupons_used_at_station_fkey(name)
      `, { count: 'exact' });
    if (params.status) query = query.eq('status', params.status);
    if (params.beneficiaryId) query = query.eq('beneficiary_id', params.beneficiaryId);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + 19);
    if (error) throw error;
    return { data: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / 20) };
  },

  async issueCoupon(payload: {
    allocationId: string;
    beneficiaryId: string;
    fuelType: 'PETROL' | 'DIESEL';
    amount: number;
    liters: number;
    expiresAt: string;
  }) {
    // Generate a secure QR payload
    const qrPayload = `FG-${payload.beneficiaryId.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        allocation_id: payload.allocationId,
        beneficiary_id: payload.beneficiaryId,
        fuel_type: payload.fuelType,
        amount: payload.amount,
        liters: payload.liters,
        qr_payload: qrPayload,
        expires_at: payload.expiresAt,
        status: 'ACTIVE',
      })
      .select()
      .single();
    if (error) throw error;

    // Update beneficiary remaining balance
    await supabase
      .from('beneficiaries')
      .update({ remaining_balance: supabase.rpc('remaining_balance') as any })
      .eq('id', payload.beneficiaryId);

    return data;
  },

  async expireCoupon(id: string) {
    const { data, error } = await supabase
      .from('coupons')
      .update({ status: 'EXPIRED' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async cancelCoupon(id: string) {
    const { data, error } = await supabase
      .from('coupons')
      .update({ status: 'CANCELLED' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Validate QR and redeem — calls the atomic RPC */
  async validateAndRedeem(payload: {
    qrPayload: string;
    stationId: string;
    attendantId: string;
    liters: number;
  }) {
    const { data, error } = await supabase.rpc('validate_and_redeem_coupon', {
      p_qr_payload: payload.qrPayload,
      p_station_id: payload.stationId,
      p_attendant_id: payload.attendantId,
      p_liters: payload.liters,
    });
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// POLICY FUNCTIONS (Gov Admin + HQ)
// ─────────────────────────────────────────────
export const policyFunctions = {
  async getPolicies(params: { isActive?: boolean; policyType?: string } = {}) {
    let query = supabase.from('fuel_policies').select('*, created_by_profile:profiles!fuel_policies_created_by_fkey(name)');
    if (params.isActive !== undefined) query = query.eq('is_active', params.isActive);
    if (params.policyType) query = query.eq('policy_type', params.policyType);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getPolicyById(id: string) {
    const { data, error } = await supabase.from('fuel_policies').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createPolicy(payload: {
    title: string;
    description?: string;
    policyType: string;
    value?: number;
    fuelType?: string;
    effectiveFrom: string;
    effectiveTo?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('fuel_policies')
      .insert({
        title: payload.title,
        description: payload.description,
        policy_type: payload.policyType,
        value: payload.value,
        fuel_type: payload.fuelType,
        effective_from: payload.effectiveFrom,
        effective_to: payload.effectiveTo,
        created_by: user.user?.id,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePolicy(id: string, updates: Partial<FuelPolicy>) {
    const { data, error } = await supabase
      .from('fuel_policies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deactivatePolicy(id: string) {
    const { data, error } = await supabase
      .from('fuel_policies')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// SHIFT FUNCTIONS (Branch Admin)
// ─────────────────────────────────────────────
export const shiftFunctions = {
  async getShifts(params: { stationId: string; date?: string; status?: string }) {
    let query = supabase
      .from('shifts')
      .select(`
        *,
        pump_assignments(
          *,
          attendant:attendants!pump_assignments_attendant_id_fkey(
            id, profiles!attendants_id_fkey(name)
          ),
          pump:pumps(pump_label, fuel_type)
        )
      `)
      .eq('station_id', params.stationId);
    if (params.date) query = query.eq('shift_date', params.date);
    if (params.status) query = query.eq('status', params.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createShift(payload: {
    stationId: string;
    shiftDate: string;
    shiftType: 'MORNING' | 'AFTERNOON' | 'NIGHT';
    createdBy: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        station_id: payload.stationId,
        shift_date: payload.shiftDate,
        shift_type: payload.shiftType,
        start_time: new Date().toISOString(),
        created_by: payload.createdBy,
        notes: payload.notes,
        status: 'OPEN',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async closeShift(id: string) {
    const { data, error } = await supabase
      .from('shifts')
      .update({ status: 'CLOSED', end_time: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async assignPump(payload: {
    shiftId: string;
    pumpId: string;
    attendantId: string;
    assignedBy: string;
  }) {
    const { data, error } = await supabase
      .from('pump_assignments')
      .insert({
        shift_id: payload.shiftId,
        pump_id: payload.pumpId,
        attendant_id: payload.attendantId,
        assigned_by: payload.assignedBy,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// METER READING FUNCTIONS
// ─────────────────────────────────────────────
export const meterReadingFunctions = {
  async recordReading(payload: {
    shiftId: string;
    pumpId: string;
    attendantId: string;
    type: 'OPENING' | 'CLOSING';
    petrolReading: number;
    dieselReading: number;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('meter_readings')
      .insert({
        shift_id: payload.shiftId,
        pump_id: payload.pumpId,
        attendant_id: payload.attendantId,
        reading_type: payload.type,
        petrol_reading: payload.petrolReading,
        diesel_reading: payload.dieselReading,
        notes: payload.notes,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getReadingsForShift(shiftId: string) {
    const { data, error } = await supabase
      .from('meter_readings')
      .select('*, pump:pumps(pump_label, fuel_type), attendant:profiles!meter_readings_attendant_id_fkey(name)')
      .eq('shift_id', shiftId)
      .order('recorded_at');
    if (error) throw error;
    return data || [];
  },
};

// ─────────────────────────────────────────────
// RECONCILIATION FUNCTIONS
// ─────────────────────────────────────────────
export const reconciliationFunctions = {
  async getReconciliations(params: { stationId: string; year?: number; status?: string }) {
    let query = supabase
      .from('reconciliations')
      .select(`
        *,
        reconciled_by_profile:profiles!reconciliations_reconciled_by_fkey(name),
        approved_by_profile:profiles!reconciliations_approved_by_fkey(name)
      `)
      .eq('station_id', params.stationId);
    if (params.year) query = query.eq('period_year', params.year);
    if (params.status) query = query.eq('status', params.status);
    const { data, error } = await query.order('period_year', { ascending: false }).order('period_month', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async calculateReconciliation(payload: {
    stationId: string;
    periodMonth: number;
    periodYear: number;
    fuelType: 'PETROL' | 'DIESEL';
    closingStockPhysical: number;
    reconciledBy: string;
  }) {
    const { data, error } = await supabase.rpc('calculate_reconciliation', {
      p_station_id: payload.stationId,
      p_period_month: payload.periodMonth,
      p_period_year: payload.periodYear,
      p_fuel_type: payload.fuelType,
      p_closing_stock_physical: payload.closingStockPhysical,
      p_reconciled_by: payload.reconciledBy,
    });
    if (error) throw error;
    return data;
  },

  async approveReconciliation(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('reconciliations')
      .update({ status: 'APPROVED', approved_by: approvedBy, approved_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async rejectReconciliation(id: string, notes: string) {
    const { data, error } = await supabase
      .from('reconciliations')
      .update({ status: 'REJECTED', notes })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// STATION ORDERS (HQ Fuel Ordering)
// ─────────────────────────────────────────────
export const stationOrderFunctions = {
  async getOrders(params: { stationId?: string; status?: string; page?: number } = {}) {
    const page = params.page || 1;
    const from = (page - 1) * 20;
    let query = supabase
      .from('station_orders')
      .select(`
        *,
        station:stations(name),
        ordered_by_profile:profiles!station_orders_ordered_by_fkey(name)
      `, { count: 'exact' });
    if (params.stationId) query = query.eq('station_id', params.stationId);
    if (params.status) query = query.eq('status', params.status);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + 19);
    if (error) throw error;
    return { data: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / 20) };
  },

  async createOrder(payload: {
    stationId: string;
    fuelType: 'PETROL' | 'DIESEL';
    orderedLiters: number;
    unitPrice: number;
    supplierName?: string;
    expectedDeliveryDate?: string;
  }) {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('station_orders')
      .insert({
        station_id: payload.stationId,
        ordered_by: user.user?.id,
        fuel_type: payload.fuelType,
        ordered_liters: payload.orderedLiters,
        unit_price: payload.unitPrice,
        supplier_name: payload.supplierName,
        expected_delivery_date: payload.expectedDeliveryDate,
        status: 'PENDING',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateOrderStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('station_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// TRANSACTION FUNCTIONS
// ─────────────────────────────────────────────
export const transactionFunctions = {
  async getTransactions(params: {
    page?: number;
    stationId?: string;
    userId?: string;
    fuelType?: string;
    mode?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const page = params.page || 1;
    const from = (page - 1) * 20;
    let query = supabase
      .from('transactions')
      .select(`
        *,
        user:profiles!transactions_user_id_fkey(name, role),
        station:stations(name),
        attendant:profiles!transactions_attendant_id_fkey(name)
      `, { count: 'exact' });
    if (params.stationId) query = query.eq('station_id', params.stationId);
    if (params.userId) query = query.eq('user_id', params.userId);
    if (params.fuelType) query = query.eq('fuel_type', params.fuelType);
    if (params.mode) query = query.eq('mode', params.mode);
    if (params.status) query = query.eq('status', params.status);
    if (params.startDate) query = query.gte('created_at', params.startDate);
    if (params.endDate) query = query.lte('created_at', params.endDate);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + 19);
    if (error) throw error;
    return { data: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / 20) };
  },

  /** Record cash sale atomically via RPC */
  async recordCashSale(payload: {
    stationId: string;
    attendantId: string;
    userId?: string;
    fuelType: 'PETROL' | 'DIESEL';
    liters: number;
    amount: number;
    shiftId?: string;
    pumpId?: string;
  }) {
    const { data, error } = await supabase.rpc('record_cash_sale', {
      p_station_id: payload.stationId,
      p_attendant_id: payload.attendantId,
      p_user_id: payload.userId || null,
      p_fuel_type: payload.fuelType,
      p_liters: payload.liters,
      p_amount: payload.amount,
      p_shift_id: payload.shiftId || null,
      p_pump_id: payload.pumpId || null,
    });
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// PAYMENT FUNCTIONS
// ─────────────────────────────────────────────
export const paymentFunctions = {
  async getPayments(params: { page?: number; status?: string; startDate?: string; endDate?: string } = {}) {
    const page = params.page || 1;
    const from = (page - 1) * 20;
    let query = supabase
      .from('payments')
      .select(`
        *,
        user:profiles!payments_user_id_fkey(name),
        transaction:transactions!payments_transaction_id_fkey(reference_number, fuel_type, liters)
      `, { count: 'exact' });
    if (params.status) query = query.eq('status', params.status);
    if (params.startDate) query = query.gte('created_at', params.startDate);
    if (params.endDate) query = query.lte('created_at', params.endDate);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + 19);
    if (error) throw error;
    return { data: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / 20) };
  },

  async getPaymentById(id: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`*, user:profiles!payments_user_id_fkey(name), transaction:transactions(reference_number)`)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async retryPayment(id: string) {
    const { data: payment } = await supabase.from('payments').select('*').eq('id', id).single();
    const { data, error } = await supabase
      .from('payments')
      .update({
        status: 'SUCCESS',
        retry_count: (payment?.retry_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async processRefund(id: string) {
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'REFUNDED', refunded: true, refunded_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// BILLING FUNCTIONS (HQ)
// ─────────────────────────────────────────────
export const billingFunctions = {
  async getBillingRecords(params: { stationId?: string; status?: string; page?: number } = {}) {
    const page = params.page || 1;
    const from = (page - 1) * 20;
    let query = supabase
      .from('billing_records')
      .select(`
        *,
        station:stations(name),
        department:departments(name),
        generated_by_profile:profiles!billing_records_generated_by_fkey(name)
      `, { count: 'exact' });
    if (params.stationId) query = query.eq('station_id', params.stationId);
    if (params.status) query = query.eq('payment_status', params.status);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + 19);
    if (error) throw error;
    return { data: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / 20) };
  },

  async generateBill(payload: {
    stationId: string;
    departmentId: string;
    periodStart: string;
    periodEnd: string;
    totalLiters: number;
    totalAmount: number;
  }) {
    const { data: user } = await supabase.auth.getUser();
    const invoiceNumber = `INV-${Date.now()}`;
    const { data, error } = await supabase
      .from('billing_records')
      .insert({
        station_id: payload.stationId,
        department_id: payload.departmentId,
        billing_period_start: payload.periodStart,
        billing_period_end: payload.periodEnd,
        total_liters_billed: payload.totalLiters,
        total_amount: payload.totalAmount,
        payment_status: 'INVOICED',
        invoice_number: invoiceNumber,
        generated_by: user.user?.id,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async markAsPaid(id: string) {
    const { data, error } = await supabase
      .from('billing_records')
      .update({ payment_status: 'PAID', paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// NOTIFICATION FUNCTIONS
// ─────────────────────────────────────────────
export const notificationFunctions = {
  async getNotifications(userId: string, params: { unreadOnly?: boolean } = {}) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);
    if (params.unreadOnly) query = query.eq('is_read', false);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return data || [];
  },

  async markAsRead(id: string) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  },

  async sendNotification(payload: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /** Subscribe to real-time notifications for a user */
  subscribeToNotifications(userId: string, onNew: (notification: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => onNew(payload.new))
      .subscribe();
  },
};

// ─────────────────────────────────────────────
// AUDIT LOG FUNCTIONS
// ─────────────────────────────────────────────
export const auditFunctions = {
  async getAuditLogs(params: { page?: number; userId?: string; entityType?: string; action?: string } = {}) {
    const page = params.page || 1;
    const from = (page - 1) * 20;
    let query = supabase
      .from('audit_logs')
      .select(`*, user:profiles!audit_logs_user_id_fkey(name, role)`, { count: 'exact' });
    if (params.userId) query = query.eq('user_id', params.userId);
    if (params.entityType) query = query.eq('entity_type', params.entityType);
    if (params.action) query = query.ilike('action', `%${params.action}%`);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + 19);
    if (error) throw error;
    return { data: data || [], total: count || 0, page, totalPages: Math.ceil((count || 0) / 20) };
  },

  async logAction(payload: {
    action: string;
    entityType: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
  }) {
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from('audit_logs').insert({
      user_id: user.user?.id,
      action: payload.action,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      old_values: payload.oldValues,
      new_values: payload.newValues,
    });
    if (error) console.error('Audit log error:', error);
  },
};

// ─────────────────────────────────────────────
// ATTENDANT FUNCTIONS
// ─────────────────────────────────────────────
export const attendantFunctions = {
  async getAttendants(params: { page?: number; search?: string; stationId?: string; status?: string } = {}) {
    const page = params.page || 1;
    const from = (page - 1) * 20;
    
    let selectStr = `
      *,
      attendant:attendants!attendants_id_fkey(*, station:stations(name))
    `;
    if (params.stationId) {
      selectStr = `
        *,
        attendant:attendants!attendants_id_fkey!inner(*, station:stations(name))
      `;
    }
    
    let query = supabase
      .from('profiles')
      .select(selectStr, { count: 'exact' })
      .eq('role', 'ATTENDANT');
      
    if (params.search) query = query.or(`name.ilike.%${params.search}%,phone_number.ilike.%${params.search}%`);
    if (params.stationId) {
      query = query.eq('attendant.station_id', params.stationId);
    }
    const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + 19);
    if (error) throw error;
    
    const formattedData = (data || []).map((p: any) => ({
      ...p,
      profile: {
        id: p.id,
        name: p.name,
        email: p.email,
        phone_number: p.phone_number,
        role: p.role,
      }
    }));
    
    return { data: formattedData, total: count || 0, page, totalPages: Math.ceil((count || 0) / 20) };
  },

  async createAttendant(payload: {
    name: string;
    phoneNumber: string;
    email: string;
    password?: string;
    stationId: string;
    employeeId?: string;
  }) {
    const registerClient = createRegisterClient();
    const tempPassword = payload.password || 'TempPass123!';
    const { data: authData, error: authError } = await registerClient.auth.signUp({
      email: payload.email,
      password: tempPassword,
      options: {
        data: {
          name: payload.name,
          role: 'ATTENDANT',
          phone_number: payload.phoneNumber || null,
          is_verified: false,
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Auth registration failed');

    const { data, error } = await supabase
      .from('attendants')
      .insert({
        id: authData.user.id,
        station_id: payload.stationId,
        employee_id: payload.employeeId || `ATT-${Date.now()}`,
        status: 'ACTIVE',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async suspendAttendant(id: string) {
    const { data, error } = await supabase
      .from('attendants')
      .update({ status: 'SUSPENDED', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async activateAttendant(id: string) {
    const { data, error } = await supabase
      .from('attendants')
      .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// DEPARTMENT FUNCTIONS
// ─────────────────────────────────────────────
export const departmentFunctions = {
  async getDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*, company:companies(name)')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async createDepartment(payload: { name: string; code: string; companyId?: string; monthlyBudget?: number }) {
    const { data, error } = await supabase
      .from('departments')
      .insert({
        name: payload.name,
        code: payload.code,
        company_id: payload.companyId,
        monthly_budget: payload.monthlyBudget || 0,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ─────────────────────────────────────────────
// ADMIN USER & KYC FUNCTIONS
// ─────────────────────────────────────────────
export const adminUserFunctions = {
  async getAdminProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['SUPER_ADMIN', 'GOVERNMENT_ADMIN', 'STATION_HQ', 'STATION_BRANCH', 'ATTENDANT'])
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateKycStatus(userId: string, kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ kyc_status: kycStatus })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleUserActive(userId: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteUserProfile(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    if (error) throw error;
  },
};

// ─────────────────────────────────────────────
// Re-export Supabase client for one-off uses
// ─────────────────────────────────────────────
export { supabase };
