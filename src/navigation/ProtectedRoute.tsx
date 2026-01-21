'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';
import { getDashboardPathForRole, canAccessRoute } from '@/utils/routing';
import { AdminRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AdminRole | AdminRole[];
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && user) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Redirect to role-specific dashboard if on generic dashboard
      if (pathname === '/dashboard' && user.role) {
        const roleDashboard = getDashboardPathForRole(user.role);
        router.push(roleDashboard);
        return;
      }

      // Check route access
      if (pathname && !canAccessRoute(user.role, pathname)) {
        const roleDashboard = getDashboardPathForRole(user.role);
        router.push(roleDashboard);
        return;
      }

      // Check required role
      if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(user.role)) {
          const roleDashboard = getDashboardPathForRole(user.role);
          router.push(roleDashboard);
          return;
        }
      }

      // Check required permission
      if (requiredPermission && user.permissions && !user.permissions.includes(requiredPermission)) {
        const roleDashboard = getDashboardPathForRole(user.role);
        router.push(roleDashboard);
        return;
      }
    }
  }, [isAuthenticated, loading, user, requiredRole, requiredPermission, router, pathname]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};
