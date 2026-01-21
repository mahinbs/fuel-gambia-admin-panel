'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDepartmentOfficerDashboard } from '@/store/slices/dashboardSlice';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  Fuel,
  UserCheck,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatCurrency, formatNumber, formatLiters } from '@/utils/format';
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
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function DepartmentOfficerDashboardPage() {
  const dispatch = useAppDispatch();
  const { departmentOfficerStats, monthlyAllocationTrend, departmentBreakdown, usageMonitoring, loading } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDepartmentOfficerDashboard());
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Beneficiaries',
      value: formatNumber(departmentOfficerStats?.totalBeneficiaries || 0),
      icon: Users,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Monthly Allocated Fuel',
      value: formatLiters(departmentOfficerStats?.monthlyAllocatedFuel || 0),
      icon: Fuel,
      color: 'green',
      change: '+5%',
    },
    {
      title: 'Used Fuel',
      value: formatLiters(departmentOfficerStats?.usedFuel || 0),
      icon: TrendingUp,
      color: 'purple',
      change: '+8%',
    },
    {
      title: 'Remaining Fuel',
      value: formatLiters(departmentOfficerStats?.remainingFuel || 0),
      icon: CheckCircle,
      color: 'green',
      change: '-3%',
    },
    {
      title: 'Pending Verifications',
      value: departmentOfficerStats?.pendingVerifications || 0,
      icon: AlertCircle,
      color: 'yellow',
      change: '-5',
    },
    {
      title: 'Active Coupons',
      value: departmentOfficerStats?.activeCoupons || 0,
      icon: FileText,
      color: 'blue',
      change: '+15',
    },
    {
      title: 'Expired Coupons',
      value: departmentOfficerStats?.expiredCoupons || 0,
      icon: XCircle,
      color: 'red',
      change: '+2',
    },
    {
      title: 'Total Allocations',
      value: formatNumber(departmentOfficerStats?.totalAllocations || 0),
      icon: UserCheck,
      color: 'purple',
      change: '+3',
    },
  ];

  if (loading && !departmentOfficerStats) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Department Officer Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Beneficiary Management & Allocation Overview</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/beneficiaries">
            <Button variant="primary">Verify Beneficiaries</Button>
          </Link>
          <Link href="/dashboard/allocations">
            <Button variant="outline">Manage Allocations</Button>
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
        <Card title="Monthly Allocation Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyAllocationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatLiters(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="allocated" stroke="#3b82f6" strokeWidth={2} name="Allocated" />
              <Line type="monotone" dataKey="used" stroke="#10b981" strokeWidth={2} name="Used" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Department-wise Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatLiters(Number(value))} />
              <Legend />
              <Bar dataKey="allocated" fill="#3b82f6" name="Allocated" />
              <Bar dataKey="used" fill="#10b981" name="Used" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Usage Monitoring">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageMonitoring} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip formatter={(value) => formatLiters(Number(value))} />
              <Legend />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link href="/dashboard/beneficiaries">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Beneficiary Verification</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review and approve beneficiary documents</p>
              </div>
            </Link>
            <Link href="/dashboard/allocations">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Allocation Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Assign monthly fuel amounts to beneficiaries</p>
              </div>
            </Link>
            <Link href="/dashboard/coupons">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Coupon Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View and manage issued coupons</p>
              </div>
            </Link>
            <Link href="/dashboard/reports">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Reports</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Generate and export department reports</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
