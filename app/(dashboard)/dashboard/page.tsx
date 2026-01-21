'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardData, addLiveFeedItem } from '@/store/slices/dashboardSlice';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  UserCheck,
  DollarSign,
  TrendingUp,
  Activity,
  MapPin,
  AlertTriangle,
  XCircle,
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
import { io } from 'socket.io-client';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, monthlySubsidyTrend, paidFuelSalesTrend, fuelTypeDistribution, stationWiseVolume, liveFeed, loading } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  // Mock socket connection for live feed
  useEffect(() => {
    const socket = io('http://localhost:3001', { transports: ['websocket'] });
    
    // Simulate live feed updates
    const interval = setInterval(() => {
      const events = [
        { type: 'QR_SCAN', message: 'QR code scanned at Station A', timestamp: new Date() },
        { type: 'REDEMPTION', message: 'Fuel redeemed by User 123', timestamp: new Date() },
        { type: 'PAYMENT', message: 'Payment successful: GMD 500', timestamp: new Date() },
        { type: 'INVENTORY', message: 'Inventory synced at Station B', timestamp: new Date() },
      ];
      const event = events[Math.floor(Math.random() * events.length)];
      dispatch(addLiveFeedItem({ ...event, id: Math.random().toString() }));
    }, 5000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [dispatch]);

  const statCards = [
    {
      title: 'Total Beneficiaries',
      value: stats?.totalBeneficiaries || 0,
      icon: Users,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Pending Verifications',
      value: stats?.pendingVerifications || 0,
      icon: UserCheck,
      color: 'yellow',
      change: '-5%',
    },
    {
      title: 'Total Subsidy Issued',
      value: formatCurrency(stats?.totalSubsidyIssued || 0),
      icon: DollarSign,
      color: 'green',
      change: '+8%',
    },
    {
      title: 'Commercial Revenue',
      value: formatCurrency(stats?.totalCommercialRevenue || 0),
      icon: TrendingUp,
      color: 'purple',
      change: '+15%',
    },
    {
      title: "Today's Transactions",
      value: stats?.todayTransactions || 0,
      icon: Activity,
      color: 'blue',
      change: '+3%',
    },
    {
      title: 'Active Stations',
      value: stats?.activeStations || 0,
      icon: MapPin,
      color: 'green',
      change: '+2',
    },
    {
      title: 'Low Inventory Alerts',
      value: stats?.lowInventoryAlerts || 0,
      icon: AlertTriangle,
      color: 'yellow',
      change: '-1',
    },
    {
      title: 'Failed QR Scans',
      value: stats?.failedQRScans || 0,
      icon: XCircle,
      color: 'red',
      change: '-2',
    },
    {
      title: 'Payment Failures',
      value: stats?.paymentFailures || 0,
      icon: CreditCard,
      color: 'red',
      change: '-3',
    },
  ];

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to Fuel Gambia Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <Badge variant={stat.change.startsWith('+') ? 'success' : 'default'} size="sm">
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
        <Card title="Monthly Subsidy Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySubsidyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Paid Fuel Sales Trend">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paidFuelSalesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Fuel Type Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fuelTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {fuelTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Station-wise Volume">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stationWiseVolume} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip formatter={(value) => formatLiters(Number(value))} />
              <Legend />
              <Bar dataKey="value" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Live Feed */}
      <Card title="Live Activity Feed">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {liveFeed.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
          ) : (
            liveFeed.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{item.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
