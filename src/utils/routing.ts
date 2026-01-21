import { AdminRole } from '@/types';

export const ROLE_DASHBOARD_PATHS: Record<AdminRole, string> = {
  [AdminRole.SUPER_ADMIN]: '/dashboard/super-admin',
  [AdminRole.DEPARTMENT_OFFICER]: '/dashboard/department-officer',
  [AdminRole.STATION_MANAGER]: '/dashboard/station-manager',
};

export const getDashboardPathForRole = (role: AdminRole): string => {
  return ROLE_DASHBOARD_PATHS[role] || '/dashboard';
};

export const canAccessRoute = (userRole: AdminRole, route: string): boolean => {
  const routePermissions: Record<string, AdminRole[]> = {
    // Super Admin only routes
    '/dashboard/super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/policies': [AdminRole.SUPER_ADMIN],
    '/dashboard/users': [AdminRole.SUPER_ADMIN],
    '/dashboard/station-approvals': [AdminRole.SUPER_ADMIN],
    '/dashboard/analytics': [AdminRole.SUPER_ADMIN],
    '/dashboard/stations': [AdminRole.SUPER_ADMIN],
    '/dashboard/inventory-super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/beneficiaries-super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/transactions-super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/reports-super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/notifications-super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/settings-super-admin': [AdminRole.SUPER_ADMIN],
    
    // Department Officer routes
    '/dashboard/department-officer': [AdminRole.DEPARTMENT_OFFICER],
    '/dashboard/beneficiaries': [AdminRole.DEPARTMENT_OFFICER],
    '/dashboard/allocations': [AdminRole.DEPARTMENT_OFFICER],
    '/dashboard/coupons': [AdminRole.DEPARTMENT_OFFICER],
    '/dashboard/usage-monitoring': [AdminRole.DEPARTMENT_OFFICER],
    '/dashboard/transactions-department-officer': [AdminRole.DEPARTMENT_OFFICER],
    '/dashboard/reports-department-officer': [AdminRole.DEPARTMENT_OFFICER],
    '/dashboard/notifications-department-officer': [AdminRole.DEPARTMENT_OFFICER],
    '/dashboard/settings-department-officer': [AdminRole.DEPARTMENT_OFFICER],
    
    // Station Manager routes
    '/dashboard/station-manager': [AdminRole.STATION_MANAGER],
    '/dashboard/inventory': [AdminRole.STATION_MANAGER],
    '/dashboard/attendants': [AdminRole.STATION_MANAGER],
    '/dashboard/transactions-station-manager': [AdminRole.STATION_MANAGER],
    '/dashboard/settlements': [AdminRole.STATION_MANAGER],
    '/dashboard/reports-station-manager': [AdminRole.STATION_MANAGER],
    '/dashboard/notifications-station-manager': [AdminRole.STATION_MANAGER],
    '/dashboard/settings-station-manager': [AdminRole.STATION_MANAGER],
  };

  const allowedRoles = routePermissions[route] || [];
  return allowedRoles.includes(userRole);
};
