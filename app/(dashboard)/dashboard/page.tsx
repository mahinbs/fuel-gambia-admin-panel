'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';
import { getDashboardPathForRole } from '@/utils/routing';

/**
 * /dashboard — Gateway page.
 *
 * This page exists solely to redirect authenticated users to their
 * role-specific dashboard (e.g. /dashboard/super-admin).
 *
 * It is needed because the app always redirects to "/dashboard" after
 * login, but the actual content lives under role-specific sub-routes.
 */
export default function DashboardIndexPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.role) {
      const path = getDashboardPathForRole(user.role);
      router.replace(path);
    }
  }, [isAuthenticated, loading, user, router]);

  // Show a full-screen loader while we determine the redirect target
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50 dark:bg-slate-900">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm tracking-wide">
        Redirecting to your dashboard…
      </p>
    </div>
  );
}
