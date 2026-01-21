'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserCog,
  MapPin,
  Package,
  Receipt,
  CreditCard,
  QrCode,
  Bell,
  FileText,
  Settings,
  LogOut,
  Shield,
  FileCheck,
  BarChart3,
  ClipboardList,
  Wallet,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { AdminRole } from '@/types';
import { getDashboardPathForRole } from '@/utils/routing';
import { Badge } from '@/components/ui/Badge';

interface MenuItem {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  path: string;
  roles: AdminRole[];
}

const allMenuItems: MenuItem[] = [
  // Super Admin Menu
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: Shield, label: 'Policy Management', path: '/dashboard/policies', roles: [AdminRole.SUPER_ADMIN] },
  { icon: Users, label: 'User & Role Management', path: '/dashboard/users', roles: [AdminRole.SUPER_ADMIN] },
  { icon: FileCheck, label: 'Station Approvals', path: '/dashboard/station-approvals', roles: [AdminRole.SUPER_ADMIN] },
  { icon: BarChart3, label: 'Analytics & Audits', path: '/dashboard/analytics', roles: [AdminRole.SUPER_ADMIN] },
  
  // Department Officer Menu
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/department-officer', roles: [AdminRole.DEPARTMENT_OFFICER] },
  { icon: UserCheck, label: 'Beneficiary Verification', path: '/dashboard/beneficiaries', roles: [AdminRole.DEPARTMENT_OFFICER] },
  { icon: ClipboardList, label: 'Allocation Management', path: '/dashboard/allocations', roles: [AdminRole.DEPARTMENT_OFFICER] },
  { icon: Wallet, label: 'Coupon Management', path: '/dashboard/coupons', roles: [AdminRole.DEPARTMENT_OFFICER] },
  { icon: TrendingUp, label: 'Usage Monitoring', path: '/dashboard/usage-monitoring', roles: [AdminRole.DEPARTMENT_OFFICER] },
  
  // Station Manager Menu
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/station-manager', roles: [AdminRole.STATION_MANAGER] },
  { icon: Package, label: 'Inventory Management', path: '/dashboard/inventory', roles: [AdminRole.STATION_MANAGER] },
  { icon: UserCog, label: 'Attendant Management', path: '/dashboard/attendants', roles: [AdminRole.STATION_MANAGER] },
  { icon: Receipt, label: 'Transaction Monitoring', path: '/dashboard/transactions-station-manager', roles: [AdminRole.STATION_MANAGER] },
  { icon: CreditCard, label: 'Monthly Settlement', path: '/dashboard/settlements', roles: [AdminRole.STATION_MANAGER] },
  
  // Super Admin Additional Menu Items
  { icon: Receipt, label: 'Transactions', path: '/dashboard/transactions-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: MapPin, label: 'Stations', path: '/dashboard/stations', roles: [AdminRole.SUPER_ADMIN] },
  { icon: Package, label: 'Inventory Overview', path: '/dashboard/inventory-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: UserCheck, label: 'Beneficiaries Overview', path: '/dashboard/beneficiaries-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: FileText, label: 'Reports', path: '/dashboard/reports-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: Bell, label: 'Notifications', path: '/dashboard/notifications-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  
  // Department Officer Additional Menu Items
  { icon: Receipt, label: 'Subsidy Transactions', path: '/dashboard/transactions-department-officer', roles: [AdminRole.DEPARTMENT_OFFICER] },
  { icon: FileText, label: 'Reports', path: '/dashboard/reports-department-officer', roles: [AdminRole.DEPARTMENT_OFFICER] },
  { icon: Bell, label: 'Notifications', path: '/dashboard/notifications-department-officer', roles: [AdminRole.DEPARTMENT_OFFICER] },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings-department-officer', roles: [AdminRole.DEPARTMENT_OFFICER] },
  
  // Station Manager Additional Menu Items (Transaction Monitoring already in main menu)
  { icon: FileText, label: 'Reports', path: '/dashboard/reports-station-manager', roles: [AdminRole.STATION_MANAGER] },
  { icon: Bell, label: 'Notifications', path: '/dashboard/notifications-station-manager', roles: [AdminRole.STATION_MANAGER] },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings-station-manager', roles: [AdminRole.STATION_MANAGER] },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const menuItems = useMemo(() => {
    if (!user?.role) return [];
    return allMenuItems.filter(item => item.roles.includes(user.role));
  }, [user?.role]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  const getRoleLabel = (role: AdminRole) => {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return 'Super Admin';
      case AdminRole.DEPARTMENT_OFFICER:
        return 'Dept. Officer';
      case AdminRole.STATION_MANAGER:
        return 'Station Manager';
      default:
        return 'Admin';
    }
  };

  return (
    <div className="h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fuel Gambia</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin Panel</p>
        {user?.role && (
          <Badge variant="default" size="sm" className="mt-2">
            {getRoleLabel(user.role)}
          </Badge>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="mb-3 px-4 py-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};
