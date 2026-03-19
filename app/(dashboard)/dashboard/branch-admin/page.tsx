'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchBranchDashboard } from '@/store/slices/dashboardSlice';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  UserPlus,
  UserCog,
  Clock,
  Package,
  Wallet,
  Activity,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatLiters } from '@/utils/format';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import Link from 'next/link';

export default function BranchAdminDashboard() {
  const dispatch = useAppDispatch();
  const { branchAdminStats, inventoryLevels, transactionTrend, loading } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchBranchDashboard());
  }, [dispatch]);

  const statCards = [
    {
      title: "Today's Transactions",
      value: branchAdminStats?.todayTransactions || 0,
      icon: Activity,
      color: 'blue',
      change: '+10%',
    },
    {
      title: 'Current Petrol Stock',
      value: formatLiters(branchAdminStats?.petrolStock || 0),
      icon: Package,
      color: 'green',
      change: 'Normal',
    },
    {
      title: 'Current Diesel Stock',
      value: formatLiters(branchAdminStats?.dieselStock || 0),
      icon: Package,
      color: 'green',
      change: 'Normal',
    },
    {
      title: 'Active Attendants',
      value: branchAdminStats?.activeAttendants || 0,
      icon: UserCog,
      color: 'purple',
      change: 'Online',
    },
    {
      title: 'Daily Reconciliation',
      value: 'Pending',
      icon: Wallet,
      color: 'yellow',
      change: 'Update',
    },
    {
      title: 'Low Stock Alerts',
      value: branchAdminStats?.lowStockAlerts || 0,
      icon: Package,
      color: 'red',
      change: '0',
    },
  ];

  if (loading && !branchAdminStats) {
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton height={120} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Station Branch Dashboard</h1>
          <p className="text-slate-500 font-medium mt-2">Manage daily operations at your individual station branch</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/onboarding-branch">
            <Button variant="primary" size="lg" className="shadow-blue-500/20 hover:shadow-xl transition-all">Add Staff</Button>
          </Link>
          <Link href="/dashboard/inventory-branch">
            <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900">Update Stock</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden group">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.title}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-black",
                      stat.change === 'Normal' || stat.change === 'Online' || (stat.change.includes('%') && !stat.change.startsWith('-'))
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                        : stat.change.startsWith('-') || stat.change === '0'
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    )}>
                      {stat.change}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 italic">status summary</span>
                  </div>
                </div>
                <div className={cn(
                  "p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110",
                  stat.color === 'blue' ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" :
                  stat.color === 'green' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                  stat.color === 'purple' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" :
                  stat.color === 'red' ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" :
                  "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                )}>
                  <Icon size={28} strokeWidth={2.5} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Current Inventory (Liters)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryLevels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatLiters(Number(value))} />
              <Legend />
              <Bar dataKey="current" fill="#3b82f6" name="Current Stock" />
              <Bar dataKey="threshold" fill="#ef4444" name="Low Stock Threshold" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Transaction Volume Trend">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="subsidy" fill="#3b82f6" name="Subsidy (QR)" />
              <Bar dataKey="commercial" fill="#10b981" name="Commercial (Cash/Mobile)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
