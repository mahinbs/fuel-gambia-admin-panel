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
  // Common Settings (available to all)
  { icon: Settings, label: 'Settings', path: '/dashboard/settings-super-admin', roles: [AdminRole.SUPER_ADMIN, AdminRole.STATION_HQ, AdminRole.STATION_BRANCH, AdminRole.GOVERNMENT_ADMIN] },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const menuSections = useMemo(() => {
    if (!user?.role) return [];
    
    const items = allMenuItems.filter(item => item.roles.includes(user.role));
    
    // Categorize items
    const overview = items.filter(i => i.label === 'Overview');
    const management = items.filter(i => 
      ['Company Onboarding', 'Companies Onboarding', 'User Management', 'Staff Management', 'Staff/User Management', 'Pump Attendants', 'Station Management'].includes(i.label)
    );
    const operations = items.filter(i => 
      ['Receive Income', 'Fuel Consumption', 'Fuel Allocation', 'Approvals', 'Policy Management', 'Fuel Ordering', 'Coupon Billing', 'Onboarding Staff', 'Shift Management', 'Inventory Management', 'Daily Reconciliation'].includes(i.label)
    );
    const analytics = items.filter(i => 
      ['Reports', 'Reporting'].includes(i.label)
    );
    const system = items.filter(i => i.label === 'Settings');

    return [
      { title: 'Overview', items: overview },
      { title: 'Management', items: management },
      { title: 'Operations', items: operations },
      { title: 'Analytics', items: analytics },
      { title: 'System', items: system },
    ].filter(section => section.items.length > 0);
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
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/30">
            <Fuel className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Fuel Gambia</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Admin System</p>
          </div>
        </div>
        
        {user?.role && (
          <div className="bg-slate-800/50 rounded-2xl p-3 border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Access Level</p>
            <p className="text-xs font-bold text-blue-400">
              {getRoleLabel(user.role)}
            </p>
          </div>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                
                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group relative',
                        isActive
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      )}
                    >
                      <Icon size={18} className={cn(
                        'transition-colors duration-300',
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'
                      )} />
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                      {isActive && (
                        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
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
