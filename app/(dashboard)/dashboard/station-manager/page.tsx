'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStationManagerDashboard } from '@/store/slices/dashboardSlice';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  DollarSign,
  Fuel,
  Package,
  AlertTriangle,
  Receipt,
  Users,
  TrendingUp,
  CreditCard,
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

export default function StationManagerDashboardPage() {
  const dispatch = useAppDispatch();
  const { stationManagerStats, dailySalesTrend, inventoryLevels, transactionTrend, loading } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchStationManagerDashboard());
  }, [dispatch]);

  const statCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(stationManagerStats?.todaySales || 0),
      icon: DollarSign,
      color: 'green',
      change: '+15%',
    },
    {
      title: 'Monthly Fuel Dispensed',
      value: formatLiters(stationManagerStats?.monthlyFuelDispensed || 0),
      icon: Fuel,
      color: 'blue',
      change: '+8%',
    },
    {
      title: 'Petrol Stock',
      value: formatLiters(stationManagerStats?.petrolStock || 0),
      icon: Package,
      color: stationManagerStats && stationManagerStats.petrolStock < 5000 ? 'red' : 'green',
      change: '-200L',
    },
    {
      title: 'Diesel Stock',
      value: formatLiters(stationManagerStats?.dieselStock || 0),
      icon: Package,
      color: stationManagerStats && stationManagerStats.dieselStock < 5000 ? 'red' : 'green',
      change: '-150L',
    },
    {
      title: 'Low Stock Alerts',
      value: stationManagerStats?.lowStockAlerts || 0,
      icon: AlertTriangle,
      color: 'yellow',
      change: '-1',
    },
    {
      title: 'Pending Reimbursements',
      value: formatCurrency(stationManagerStats?.pendingReimbursements || 0),
      icon: CreditCard,
      color: 'purple',
      change: '+2',
    },
    {
      title: "Today's Transactions",
      value: formatNumber(stationManagerStats?.todayTransactions || 0),
      icon: Receipt,
      color: 'blue',
      change: '+12',
    },
    {
      title: 'Active Attendants',
      value: stationManagerStats?.activeAttendants || 0,
      icon: Users,
      color: 'green',
      change: '+1',
    },
  ];

  if (loading && !stationManagerStats) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Station Manager Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Fuel Station Operations Overview</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/inventory">
            <Button variant="primary">Manage Inventory</Button>
          </Link>
          <Link href="/dashboard/settlements">
            <Button variant="outline">Monthly Settlement</Button>
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
        <Card title="Daily Sales Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySalesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="Sales" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Inventory Levels">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryLevels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatLiters(Number(value))} />
              <Legend />
              <Bar dataKey="current" fill="#3b82f6" name="Current Stock" />
              <Bar dataKey="threshold" fill="#ef4444" name="Low Threshold" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Transaction Trend">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transactionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="subsidy" fill="#3b82f6" name="Subsidy" />
              <Bar dataKey="commercial" fill="#10b981" name="Commercial" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link href="/dashboard/inventory">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Inventory Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add stock, view levels, and manage inventory</p>
              </div>
            </Link>
            <Link href="/dashboard/attendants">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Attendant Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage station attendants</p>
              </div>
            </Link>
            <Link href="/dashboard/transactions">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Transaction Monitoring</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View live transactions and receipts</p>
              </div>
            </Link>
            <Link href="/dashboard/settlements">
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 cursor-pointer transition-colors">
                <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Settlement</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Submit monthly reports and track payments</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
