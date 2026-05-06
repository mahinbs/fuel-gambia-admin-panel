'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSuperAdminDashboard } from '@/store/slices/dashboardSlice';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  DollarSign,
  Fuel,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Users,
  UserCheck,
  FileCheck,
  Building,
  CreditCard,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatLiters } from '@/utils/format';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SuperAdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { superAdminStats, monthlyFuelUsage, budgetVsConsumption, subsidyVsCommercial, loading } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchSuperAdminDashboard());
  }, [dispatch]);

  const statCards = [
    {
      title: 'National Budget',
      value: formatCurrency(superAdminStats?.totalNationalBudget || 0),
      icon: DollarSign,
      color: 'blue',
      change: '+5.4%',
    },
    {
      title: 'Fuel Dispensed',
      value: formatLiters(superAdminStats?.totalFuelDispensed || 0),
      icon: Fuel,
      color: 'green',
      change: '+12.8%',
    },
    {
      title: 'Mobile Users',
      value: formatNumber(superAdminStats?.totalMobileUsers || 0),
      icon: Users,
      color: 'blue',
      change: '+15.2%',
    },
    {
      title: 'Branch Network',
      value: formatNumber(superAdminStats?.totalBranchUsers || 0),
      icon: MapPin,
      color: 'purple',
      change: '+2.1%',
    },
  ];

  if (loading && !superAdminStats) {
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <Skeleton height={120} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Overview</h1>
            <p className="text-slate-500 font-medium mt-2">National Fuel Subsidy & Operations Management</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/reports-super-admin" prefetch={false}>
              <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900 shadow-sm font-black text-xs uppercase tracking-widest">
                Analytics
              </Button>
            </Link>
            <Link href="/dashboard/settings-super-admin">
              <Button variant="primary" size="lg" className="shadow-blue-500/20 hover:shadow-xl transition-all">
                System Config
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-8 border-none shadow-2xl relative overflow-hidden group">
                <div className="flex justify-between items-center relative z-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                        {stat.change}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 italic">vs last month</span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                    stat.color === 'blue' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-500" :
                    stat.color === 'green' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" :
                    "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"
                  )}>
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 border-none shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">National Fuel Consumption</h3>
              <Badge variant="info" className="font-black">Monthly Trend</Badge>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyFuelUsage}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => formatLiters(Number(value))} 
                  />
                  <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                  <Line type="monotone" dataKey="subsidy" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6, strokeWidth: 0}} name="Subsidy" />
                  <Line type="monotone" dataKey="commercial" stroke="#10b981" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6, strokeWidth: 0}} name="Commercial" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Budget Utilization</h3>
              <Badge variant="success" className="font-black">Real-time</Badge>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetVsConsumption}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => formatCurrency(Number(value))} 
                  />
                  <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                  <Bar dataKey="budget" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={20} name="Budget" />
                  <Bar dataKey="consumption" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} name="Consumption" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-8 border-none shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Subsidy Distribution</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Subsidy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Commercial</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subsidyVsCommercial}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {subsidyVsCommercial.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-8">System Actions</h3>
            <div className="space-y-4">
              {[
                { label: 'Access Control', sub: 'Manage admin roles', icon: UserCheck, color: 'blue', path: '/dashboard/users-super-admin' },
                { label: 'Platform Settings', sub: 'Theming & White-label', icon: FileCheck, color: 'emerald', path: '/dashboard/settings-super-admin' },
                { label: 'Audit Logs', sub: 'System-wide activity', icon: TrendingUp, color: 'amber', path: '/dashboard/reports-super-admin' },
              ].map((action) => (
                <Link key={action.label} href={action.path}>
                  <div className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      action.color === 'blue' ? "bg-blue-100 text-blue-600" :
                      action.color === 'emerald' ? "bg-emerald-100 text-emerald-600" :
                      "bg-amber-100 text-amber-600"
                    )}>
                      <action.icon size={22} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{action.label}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{action.sub}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
