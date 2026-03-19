'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserCog,
  DollarSign,
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
  Building,
  Fuel,
  CheckSquare,
  ShoppingCart,
  UserPlus,
  Clock,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { AdminRole } from '@/types';
import { getDashboardPathForRole } from '@/utils/routing';
import { Badge } from '@/components/ui/Badge';

interface MenuItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  path: string;
  roles: AdminRole[];
}

const allMenuItems: MenuItem[] = [
  // Super Admin Menu
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: Building, label: 'Company Onboarding', path: '/dashboard/companies-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: Users, label: 'User Management', path: '/dashboard/users-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: Wallet, label: 'Receive Income', path: '/dashboard/income-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: BarChart3, label: 'Fuel Consumption', path: '/dashboard/consolidation-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  { icon: FileText, label: 'Reports', path: '/dashboard/reports-super-admin', roles: [AdminRole.SUPER_ADMIN] },
  
  // Government Admin Menu
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/government-admin', roles: [AdminRole.GOVERNMENT_ADMIN] },
  { icon: UserCog, label: 'User Management', path: '/dashboard/beneficiaries-gov', roles: [AdminRole.GOVERNMENT_ADMIN] },
  { icon: ShoppingCart, label: 'Fuel Allocation', path: '/dashboard/allocations-gov', roles: [AdminRole.GOVERNMENT_ADMIN] },
  { icon: Building, label: 'Companies Onboarding', path: '/dashboard/companies-gov', roles: [AdminRole.GOVERNMENT_ADMIN] },
  { icon: CheckSquare, label: 'Approvals', path: '/dashboard/approvals-gov', roles: [AdminRole.GOVERNMENT_ADMIN] },
  { icon: Shield, label: 'Policy Management', path: '/dashboard/policies-gov', roles: [AdminRole.GOVERNMENT_ADMIN] },
  { icon: FileText, label: 'Reports', path: '/dashboard/reports-government-admin', roles: [AdminRole.GOVERNMENT_ADMIN] },
  
  // Fuel Station HQ Menu
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/hq-admin', roles: [AdminRole.STATION_HQ] },
  { icon: MapPin, label: 'Station Management', path: '/dashboard/stations-hq', roles: [AdminRole.STATION_HQ] },
  { icon: Users, label: 'Staff Management', path: '/dashboard/staff-hq', roles: [AdminRole.STATION_HQ] },
  { icon: Package, label: 'Fuel Ordering', path: '/dashboard/ordering-hq', roles: [AdminRole.STATION_HQ] },
  { icon: Receipt, label: 'Coupon Billing', path: '/dashboard/billing-hq', roles: [AdminRole.STATION_HQ] },
  { icon: Shield, label: 'Policy Management', path: '/dashboard/policies-hq', roles: [AdminRole.STATION_HQ] },
  { icon: FileText, label: 'Reporting', path: '/dashboard/reports-hq', roles: [AdminRole.STATION_HQ] },
  
  // Fuel Station Branch Menu
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/branch-admin', roles: [AdminRole.STATION_BRANCH] },
  { icon: Users, label: 'Staff/User Management', path: '/dashboard/staff-branch', roles: [AdminRole.STATION_BRANCH] },
  { icon: UserPlus, label: 'Onboarding Staff', path: '/dashboard/onboarding-branch', roles: [AdminRole.STATION_BRANCH] },
  { icon: UserCog, label: 'Pump Attendants', path: '/dashboard/attendants-branch', roles: [AdminRole.STATION_BRANCH] },
  { icon: Clock, label: 'Shift Management', path: '/dashboard/shifts-branch', roles: [AdminRole.STATION_BRANCH] },
  { icon: ClipboardList, label: 'Inventory Management', path: '/dashboard/inventory-branch', roles: [AdminRole.STATION_BRANCH] },
  { icon: TrendingUp, label: 'Daily Reconciliation', path: '/dashboard/reconciliation-branch', roles: [AdminRole.STATION_BRANCH] },
  { icon: FileText, label: 'Reporting', path: '/dashboard/reports-branch', roles: [AdminRole.STATION_BRANCH] },
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
      case AdminRole.GOVERNMENT_ADMIN:
        return 'Gov. Admin';
      case AdminRole.STATION_HQ:
        return 'Station HQ';
      case AdminRole.STATION_BRANCH:
        return 'Station Branch';
      default:
        return 'Admin';
    }
  };

  return (
    <div className="h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Fuel className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Fuel Gambia</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Admin System</p>
          </div>
        </div>
        
        {user?.role && (
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Access Level</p>
            <p className="text-xs font-bold text-blue-400">
              {getRoleLabel(user.role)}
            </p>
          </div>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  <Icon size={18} className={cn(
                    'transition-colors',
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'
                  )} />
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-6 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50 mb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};
