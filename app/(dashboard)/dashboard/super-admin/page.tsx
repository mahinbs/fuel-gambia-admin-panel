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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">National Fuel Subsidy Management Overview</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/policies">
            <Button variant="primary">Manage Policies</Button>
          </Link>
          <Link href="/dashboard/analytics">
            <Button variant="outline">View Analytics</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                  <Badge variant={stat.change.startsWith('+') ? 'success' : 'default'} size="sm" className="mt-2">
                    {stat.change}
                  </Badge>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  <Icon className={`text-${stat.color}-600 dark:text-${stat.color}-400`} size={24} />
                </div>
              </div>
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
            <Link href="/dashboard/policies">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Policy Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage fuel policies</p>
              </div>
            </Link>
            <Link href="/dashboard/users">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">User & Role Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage officers and station managers</p>
              </div>
            </Link>
            <Link href="/dashboard/station-approvals">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Station Approvals</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review and approve station requests</p>
              </div>
            </Link>
            <Link href="/dashboard/audits">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Analytics & Audits</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View transaction logs and fraud detection</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
