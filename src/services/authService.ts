import { createClient } from '@/utils/supabase/client';
import { AdminUser, AdminRole } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { getDashboardPathForRole } from '@/utils/routing';

const supabase = createClient();

async function fetchStationIdForUser(userId: string, role: string): Promise<string | undefined> {
  if (role === 'STATION_BRANCH') {
    const { data: station } = await supabase
      .from('stations')
      .select('id')
      .eq('branch_manager_id', userId)
      .maybeSingle();
    return station?.id;
  }
  return undefined;
}

interface LoginResponse {
  user: AdminUser;
  token: string;
  refreshToken: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  confirmPassword: string;
  phoneNumber?: string;
  companyName?: string;
  departmentName?: string;
  stationName?: string;
  kycDocument1Url?: string;
  kycDocument2Url?: string;
  kycDocument3Url?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user && data.session) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      const stationId = await fetchStationIdForUser(data.user.id, profile.role);

      const adminUser: AdminUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as AdminRole,
        permissions: [],
        createdAt: profile.created_at,
        active: profile.is_active ?? true,
        kycStatus: (profile.kyc_status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
        companyName: profile.company_name || undefined,
        departmentName: profile.department_name || undefined,
        stationName: profile.station_name || undefined,
        phoneNumber: profile.phone_number || undefined,
        kycDocument1Url: profile.kyc_document_1_url || undefined,
        kycDocument2Url: profile.kyc_document_2_url || undefined,
        kycDocument3Url: profile.kyc_document_3_url || undefined,
        stationId: stationId,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(adminUser));
      }

      return {
        user: adminUser,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    }
    throw new Error('Login failed');
  },

  getDashboardPath(role: AdminRole): string {
    return getDashboardPathForRole(role);
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      window.location.href = '/login';
    }
  },

  async checkAuth(): Promise<LoginResponse | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session && session.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile) return null;

      const stationId = await fetchStationIdForUser(session.user.id, profile.role);

      const adminUser: AdminUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as AdminRole,
        permissions: [],
        createdAt: profile.created_at,
        active: profile.is_active ?? true,
        kycStatus: (profile.kyc_status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
        companyName: profile.company_name || undefined,
        departmentName: profile.department_name || undefined,
        stationName: profile.station_name || undefined,
        phoneNumber: profile.phone_number || undefined,
        kycDocument1Url: profile.kyc_document_1_url || undefined,
        kycDocument2Url: profile.kyc_document_2_url || undefined,
        kycDocument3Url: profile.kyc_document_3_url || undefined,
        stationId: stationId,
      };

      return {
        user: adminUser,
        token: session.access_token,
        refreshToken: session.refresh_token,
      };
    }
    
    return null;
  },

  async refreshToken(): Promise<string> {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data.session?.access_token || '';
  },

  async signup(data: SignupData): Promise<LoginResponse> {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          role: data.role,
          phone_number: data.phoneNumber,
          company_name: data.companyName,
          department_name: data.departmentName,
          station_name: data.stationName,
          kyc_document_1_url: data.kycDocument1Url,
          kyc_document_2_url: data.kycDocument2Url,
          kyc_document_3_url: data.kycDocument3Url,
        },
      },
    });

    if (error) throw error;

    if (authData.user) {
      const adminUser: AdminUser = {
        id: authData.user.id,
        email: authData.user.email || '',
        name: data.name,
        role: data.role,
        permissions: [],
        createdAt: authData.user.created_at,
        active: true,
        kycStatus: 'PENDING',
        companyName: data.companyName,
        departmentName: data.departmentName,
        stationName: data.stationName,
        phoneNumber: data.phoneNumber,
        kycDocument1Url: data.kycDocument1Url,
        kycDocument2Url: data.kycDocument2Url,
        kycDocument3Url: data.kycDocument3Url,
      };

      return {
        user: adminUser,
        token: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
      };
    }
    throw new Error('Signup failed');
  },

  async verifyOtp(email: string, token: string): Promise<LoginResponse> {
    const cleanEmail = email.trim().toLowerCase();
    let { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token,
      type: 'signup',
    });

    if (error) {
      // Fallback verification type
      const { data: emailData, error: emailError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token,
        type: 'email',
      });
      if (emailError) throw emailError;
      data = emailData;
    }

    if (data.user && data.session) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      const stationId = await fetchStationIdForUser(data.user.id, profile.role);

      const adminUser: AdminUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as AdminRole,
        permissions: [],
        createdAt: profile.created_at,
        active: profile.is_active ?? true,
        kycStatus: (profile.kyc_status || 'PENDING') as 'PENDING' | 'APPROVED' | 'REJECTED',
        companyName: profile.company_name || undefined,
        departmentName: profile.department_name || undefined,
        stationName: profile.station_name || undefined,
        phoneNumber: profile.phone_number || undefined,
        kycDocument1Url: profile.kyc_document_1_url || undefined,
        kycDocument2Url: profile.kyc_document_2_url || undefined,
        kycDocument3Url: profile.kyc_document_3_url || undefined,
        stationId: stationId,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(adminUser));
      }

      return {
        user: adminUser,
        token: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    }
    throw new Error('Verification failed');
  },
};
