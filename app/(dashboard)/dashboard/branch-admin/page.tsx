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

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

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
      title: "Today's Transaction Count",
      value: branchAdminStats?.todayTransactions || 0,
      icon: Activity,
      color: 'blue',
      change: '+10%',
    },
    {
      title: 'Petrol Reserve',
      value: formatLiters(branchAdminStats?.petrolStock || 0),
      icon: Package,
      color: 'green',
      change: 'Normal',
    },
    {
      title: 'Diesel Reserve',
      value: formatLiters(branchAdminStats?.dieselStock || 0),
      icon: Package,
      color: 'green',
      change: 'Normal',
    },
    {
      title: 'On-Duty Attendants',
      value: branchAdminStats?.activeAttendants || 0,
      icon: UserCog,
      color: 'purple',
      change: 'Online',
    },
    {
      title: 'Shift Reconciliation',
      value: 'Pending',
      icon: Wallet,
      color: 'yellow',
      change: 'Needs Sync',
    },
    {
      title: 'Depletion Alerts',
      value: branchAdminStats?.lowStockAlerts || 0,
      icon: Clock,
      color: 'red',
      change: 'NO CRITICALS',
    },
  ];

  if (loading && !branchAdminStats) {
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_BRANCH}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Branch Terminal</h1>
            <p className="text-slate-500 font-medium mt-2">Local station operations, inventory tracking, and personnel management</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/onboarding-branch">
              <Button variant="primary" size="lg" className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">
                Onboard Staff
              </Button>
            </Link>
            <Link href="/dashboard/inventory-branch">
              <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900 h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200 dark:border-slate-800 shadow-sm">
                Log Inventory
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-8 border-none shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden relative bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider",
                        stat.change === 'Normal' || stat.change === 'Online' || (stat.change.includes('%') && !stat.change.startsWith('-'))
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-sm" 
                          : stat.change.startsWith('-') || stat.change === '0' || stat.change === 'NO CRITICALS'
                          ? "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 shadow-sm"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm"
                      )}>
                        {stat.change}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50">Pulse</span>
                    </div>
                  </div>
                  <div className={cn(
                    "p-5 rounded-[1.5rem] shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                    stat.color === 'blue' ? "bg-blue-600 text-white shadow-blue-500/20" :
                    stat.color === 'green' ? "bg-emerald-600 text-white shadow-emerald-500/20" :
                    stat.color === 'purple' ? "bg-indigo-600 text-white shadow-indigo-500/20" :
                    stat.color === 'red' ? "bg-rose-600 text-white shadow-rose-500/20" :
                    "bg-amber-600 text-white shadow-amber-500/20"
                  )}>
                    <Icon size={32} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2rem]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Tank Volume Monitoring</h3>
              <Badge variant="info" className="font-black text-[9px] uppercase tracking-widest px-2 py-1">LITERS LIVE</Badge>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryLevels}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                    formatter={(value) => formatLiters(Number(value))} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  <Bar dataKey="current" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Current Stock" />
                  <Bar dataKey="threshold" fill="#ef4444" radius={[6, 6, 0, 0]} name="Refill Mark" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2rem]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Daily Operational Flow</h3>
              <Badge variant="success" className="font-black text-[9px] uppercase tracking-widest px-2 py-1">TX FEED</Badge>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  <Bar dataKey="subsidy" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Subsidy QR" />
                  <Bar dataKey="commercial" fill="#10b981" radius={[6, 6, 0, 0]} name="Direct Cash" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
