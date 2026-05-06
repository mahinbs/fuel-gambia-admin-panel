'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchGovernmentAdminDashboard } from '@/store/slices/dashboardSlice';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  ClipboardList,
  Fuel,
  CheckSquare,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { formatNumber, formatLiters } from '@/utils/format';
import {
  LineChart,
  Line,
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

export default function GovernmentAdminDashboard() {
  const dispatch = useAppDispatch();
  const { governmentAdminStats, monthlyAllocationTrend, departmentBreakdown, usageMonitoring, loading } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchGovernmentAdminDashboard());
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Beneficiaries',
      value: governmentAdminStats?.totalBeneficiaries || 0,
      icon: Users,
      color: 'blue',
      change: '+5%',
    },
    {
      title: 'Monthly Allocation',
      value: formatLiters(governmentAdminStats?.monthlyAllocatedFuel || 0),
      icon: Fuel,
      color: 'green',
      change: '+10%',
    },
    {
      title: 'Real-time Usage',
      value: formatLiters(governmentAdminStats?.usedFuel || 0),
      icon: TrendingUp,
      color: 'yellow',
      change: '68%',
    },
    {
      title: 'National Reserve',
      value: formatLiters(governmentAdminStats?.remainingFuel || 0),
      icon: ClipboardList,
      color: 'purple',
      change: '-2%',
    },
    {
      title: 'Pending Reviews',
      value: governmentAdminStats?.pendingVerifications || 0,
      icon: CheckSquare,
      color: 'red',
      change: '+3',
    },
    {
      title: 'Active Protocols',
      value: governmentAdminStats?.activeCoupons || 0,
      icon: AlertTriangle,
      color: 'blue',
      change: '+12%',
    },
  ];

  if (loading && !governmentAdminStats) {
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
    <ProtectedRoute requiredRole={AdminRole.GOVERNMENT_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">National Oversight</h1>
            <p className="text-slate-500 font-medium mt-2">Executive monitoring of government fuel distribution and institutional compliance</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/allocations-gov">
              <Button variant="primary" size="lg" className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">
                New Allocation
              </Button>
            </Link>
            <Link href="/dashboard/approvals-gov">
              <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900 h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200 dark:border-slate-800 shadow-sm">
                Review Queue
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
                        stat.change.includes('%') && !stat.change.startsWith('-')
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                          : stat.change.startsWith('-')
                          ? "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                          : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm"
                      )}>
                        {stat.change}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50">Trend</span>
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
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Monthly Allocation Trend</h3>
              <Badge variant="info" className="font-black text-[9px] uppercase tracking-widest px-2 py-1">LITERS</Badge>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyAllocationTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                    formatter={(value) => formatLiters(Number(value))} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  <Line type="monotone" dataKey="allocated" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} name="Authorized" />
                  <Line type="monotone" dataKey="used" stroke="#10b981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} name="Consumed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2rem]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Institutional Distribution</h3>
              <Badge variant="warning" className="font-black text-[9px] uppercase tracking-widest px-2 py-1">ACTIVE OPS</Badge>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                    formatter={(value) => formatLiters(Number(value))} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                  <Bar dataKey="allocated" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Allocation" />
                  <Bar dataKey="used" fill="#10b981" radius={[6, 6, 0, 0]} name="Consumption" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
