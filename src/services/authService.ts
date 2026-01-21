import api from './api';
import { AdminUser, AdminRole, ApiResponse } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { getDashboardPathForRole } from '@/utils/routing';

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
}

// Mock admin users for development
const MOCK_ADMINS: AdminUser[] = [
  {
    id: '1',
    email: 'superadmin@fuelgambia.com',
    name: 'Super Admin',
    role: AdminRole.SUPER_ADMIN,
    permissions: [],
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: '2',
    email: 'deptofficer@fuelgambia.com',
    name: 'Department Officer',
    role: AdminRole.DEPARTMENT_OFFICER,
    permissions: [],
    createdAt: new Date().toISOString(),
    active: true,
  },
  {
    id: '3',
    email: 'stationmanager@fuelgambia.com',
    name: 'Station Manager',
    role: AdminRole.STATION_MANAGER,
    permissions: [],
    createdAt: new Date().toISOString(),
    active: true,
  },
];

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Mock login - in production, this would call the actual API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const admin = MOCK_ADMINS.find((a) => a.email === email);
        if (admin && password === 'password123') {
          const token = `mock_token_${admin.id}_${Date.now()}`;
          const refreshToken = `mock_refresh_${admin.id}_${Date.now()}`;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(admin));
          }
          
          resolve({
            user: admin,
            token,
            refreshToken,
          });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  },

  getDashboardPath(role: AdminRole): string {
    return getDashboardPathForRole(role);
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
    return Promise.resolve();
  },

  async checkAuth(): Promise<LoginResponse | null> {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData) as AdminUser;
        return {
          user,
          token,
          refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || '',
        };
      } catch {
        return null;
      }
    }
    
    return null;
  },

  async refreshToken(): Promise<string> {
    // Mock token refresh
    return new Promise((resolve) => {
      setTimeout(() => {
        const newToken = `mock_token_refreshed_${Date.now()}`;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
        }
        resolve(newToken);
      }, 300);
    });
  },

  async signup(data: SignupData): Promise<LoginResponse> {
    // Mock signup - in production, this would call the actual API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        const existingAdmin = MOCK_ADMINS.find((a) => a.email === data.email);
        if (existingAdmin) {
          reject(new Error('Email already registered'));
          return;
        }

        // Validate password match
        if (data.password !== data.confirmPassword) {
          reject(new Error('Passwords do not match'));
          return;
        }

        // Create new admin user
        const newAdmin: AdminUser = {
          id: Date.now().toString(),
          email: data.email,
          name: data.name,
          role: data.role,
          permissions: [],
          createdAt: new Date().toISOString(),
          active: true,
        };

        // Add to mock admins (in production, this would be handled by backend)
        MOCK_ADMINS.push(newAdmin);

        const token = `mock_token_${newAdmin.id}_${Date.now()}`;
        const refreshToken = `mock_refresh_${newAdmin.id}_${Date.now()}`;

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newAdmin));
        }

        resolve({
          user: newAdmin,
          token,
          refreshToken,
        });
      }, 500);
    });
  },
};
