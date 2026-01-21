'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { AdminRole } from '@/types';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role) {
      const roleSpecificPath = 
        user.role === AdminRole.SUPER_ADMIN
          ? '/dashboard/notifications-super-admin'
          : user.role === AdminRole.DEPARTMENT_OFFICER
          ? '/dashboard/notifications-department-officer'
          : '/dashboard/notifications-station-manager';
      router.replace(roleSpecificPath);
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
