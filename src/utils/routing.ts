import { AdminRole } from '@/types';

export const ROLE_DASHBOARD_PATHS: Record<AdminRole, string> = {
  [AdminRole.SUPER_ADMIN]: '/dashboard/super-admin',
  [AdminRole.GOVERNMENT_ADMIN]: '/dashboard/government-admin',
  [AdminRole.STATION_HQ]: '/dashboard/hq-admin',
  [AdminRole.STATION_BRANCH]: '/dashboard/branch-admin',
};

export const getDashboardPathForRole = (role: AdminRole): string => {
  return ROLE_DASHBOARD_PATHS[role] || '/dashboard';
};

export const canAccessRoute = (userRole: AdminRole, route: string): boolean => {
  const routePermissions: Record<string, AdminRole[]> = {
    // Super Admin routes
    '/dashboard/super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/companies-super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/users-super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/income-super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/consolidation-super-admin': [AdminRole.SUPER_ADMIN],
    '/dashboard/reports-super-admin': [AdminRole.SUPER_ADMIN],
    
    // Government Admin routes
    '/dashboard/government-admin': [AdminRole.GOVERNMENT_ADMIN],
    '/dashboard/beneficiaries-gov': [AdminRole.GOVERNMENT_ADMIN],
    '/dashboard/allocations-gov': [AdminRole.GOVERNMENT_ADMIN],
    '/dashboard/companies-gov': [AdminRole.GOVERNMENT_ADMIN],
    '/dashboard/approvals-gov': [AdminRole.GOVERNMENT_ADMIN],
    '/dashboard/policies-gov': [AdminRole.GOVERNMENT_ADMIN],
    '/dashboard/reports-government-admin': [AdminRole.GOVERNMENT_ADMIN],
    
    // Station HQ routes
    '/dashboard/hq-admin': [AdminRole.STATION_HQ],
    '/dashboard/stations-hq': [AdminRole.STATION_HQ],
    '/dashboard/staff-hq': [AdminRole.STATION_HQ],
    '/dashboard/ordering-hq': [AdminRole.STATION_HQ],
    '/dashboard/billing-hq': [AdminRole.STATION_HQ],
    '/dashboard/policies-hq': [AdminRole.STATION_HQ],
    '/dashboard/reports-hq': [AdminRole.STATION_HQ],
    
    // Station Branch routes
    '/dashboard/branch-admin': [AdminRole.STATION_BRANCH],
    '/dashboard/staff-branch': [AdminRole.STATION_BRANCH],
    '/dashboard/onboarding-branch': [AdminRole.STATION_BRANCH],
    '/dashboard/attendants-branch': [AdminRole.STATION_BRANCH],
    '/dashboard/shifts-branch': [AdminRole.STATION_BRANCH],
    '/dashboard/inventory-branch': [AdminRole.STATION_BRANCH],
    '/dashboard/reconciliation-branch': [AdminRole.STATION_BRANCH],
    '/dashboard/reports-branch': [AdminRole.STATION_BRANCH],
  };

  const normalizedRoute = route.split('?')[0].replace(/\/$/, '') || '/';
  
  // Super Admin can access all dashboard routes
  if (userRole === AdminRole.SUPER_ADMIN && normalizedRoute.startsWith('/dashboard')) {
    return true;
  }

  const allowedRoles = routePermissions[normalizedRoute] || [];
  return allowedRoles.includes(userRole);
};
