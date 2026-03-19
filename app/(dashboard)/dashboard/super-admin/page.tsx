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
      title: 'Total National Budget',
      value: formatCurrency(superAdminStats?.totalNationalBudget || 0),
      icon: DollarSign,
      color: 'blue',
      change: '+5%',
    },
    {
      title: 'Total Fuel Dispensed',
      value: formatLiters(superAdminStats?.totalFuelDispensed || 0),
      icon: Fuel,
      color: 'green',
      change: '+12%',
    },
    {
      title: 'Monthly Subsidy Utilization',
      value: `${superAdminStats?.monthlySubsidyUtilization || 0}%`,
      icon: TrendingUp,
      color: 'purple',
      change: '-2%',
    },
    {
      title: 'Active Fuel Stations',
      value: superAdminStats?.activeFuelStations || 0,
      icon: MapPin,
      color: 'green',
      change: '+2',
    },
    {
      title: 'Fraud Alerts',
      value: superAdminStats?.fraudAlerts || 0,
      icon: AlertTriangle,
      color: 'red',
      change: '-3',
    },
    {
      title: 'Pending Station Requests',
      value: superAdminStats?.pendingStationRequests || 0,
      icon: FileCheck,
      color: 'yellow',
      change: '+1',
    },
    {
      title: 'Total Beneficiaries',
      value: formatNumber(superAdminStats?.totalBeneficiaries || 0),
      icon: Users,
      color: 'blue',
      change: '+8%',
    },
    {
      title: 'Department Officers',
      value: superAdminStats?.totalDepartmentOfficers || 0,
      icon: UserCheck,
      color: 'purple',
      change: '+1',
    },
  ];

  if (loading && !superAdminStats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton height={100} />
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
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Super Admin Dashboard</h1>
          <p className="text-slate-500 font-medium mt-2">National Fuel Subsidy Management Overview</p>
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard/policies-gov" prefetch={false}>
            <Button variant="primary" size="lg" className="shadow-blue-500/20 hover:shadow-xl transition-all">Manage Policies</Button>
          </Link>
          <Link href="/dashboard/reports-super-admin" prefetch={false}>
            <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900">View Analytics</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden group p-6 min-h-[160px] flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-2">
                  <div className={cn(
                    "p-2.5 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110",
                    stat.color === 'blue' ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" :
                    stat.color === 'green' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" :
                    stat.color === 'purple' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" :
                    stat.color === 'red' ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" :
                    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                  )}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <Badge variant={stat.change.startsWith('+') ? 'success' : 'error'} size="sm" className="font-black h-5 px-1.5 text-[9px]">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.title}</p>
                <p className="text-2xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter break-all leading-none">
                  {stat.value}
                </p>
              </div>
              {/* Decorative background shape */}
              <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 blur-2xl group-hover:opacity-10 transition-opacity",
                stat.color === 'blue' ? "bg-blue-600" :
                stat.color === 'green' ? "bg-emerald-600" :
                stat.color === 'purple' ? "bg-indigo-600" :
                stat.color === 'red' ? "bg-rose-600" :
                "bg-amber-600"
              )} />
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Fuel Usage (Nationwide)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyFuelUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatLiters(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="subsidy" stroke="#3b82f6" strokeWidth={2} name="Subsidy" />
              <Line type="monotone" dataKey="commercial" stroke="#10b981" strokeWidth={2} name="Commercial" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Budget vs Consumption">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetVsConsumption}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
              <Bar dataKey="consumption" fill="#10b981" name="Consumption" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Subsidy vs Commercial Usage">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subsidyVsCommercial}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {subsidyVsCommercial.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link href="/dashboard/policies-gov">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">National Policy Framework</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage global fuel distribution rules</p>
              </div>
            </Link>
            <Link href="/dashboard/users-super-admin">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Internal Access Control</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage administrative roles and permissions</p>
              </div>
            </Link>
            <Link href="/dashboard/approvals-gov">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Institutional Approvals</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review partner onboarding requests</p>
              </div>
            </Link>
            <Link href="/dashboard/reports-super-admin">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Consolidated Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View nationwide transaction audits</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
