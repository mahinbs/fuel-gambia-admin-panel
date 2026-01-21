'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { FraudAlert, AuditLog } from '@/types';
import { formatDate } from '@/utils/format';
import { Download, Filter, AlertTriangle } from 'lucide-react';
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

const mockFraudAlerts: FraudAlert[] = [
  {
    id: '1',
    type: 'DUPLICATE_SCAN',
    severity: 'HIGH',
    description: 'QR code scanned multiple times within 5 minutes',
    transactionId: 't1',
    userId: 'u1',
    stationId: 's1',
    detectedAt: '2024-01-15T10:30:00Z',
    status: 'PENDING',
  },
  {
    id: '2',
    type: 'ABNORMAL_VOLUME',
    severity: 'MEDIUM',
    description: 'Unusually high fuel volume dispensed',
    transactionId: 't2',
    userId: 'u2',
    stationId: 's1',
    detectedAt: '2024-01-15T09:15:00Z',
    status: 'INVESTIGATING',
  },
];

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'CREATE_POLICY',
    entityType: 'Policy',
    entityId: 'p1',
    userId: 'u1',
    userName: 'Super Admin',
    userRole: 'SUPER_ADMIN' as any,
    changes: { name: 'New Policy' },
    timestamp: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    action: 'APPROVE_BENEFICIARY',
    entityType: 'Beneficiary',
    entityId: 'b1',
    userId: 'u2',
    userName: 'Department Officer',
    userRole: 'DEPARTMENT_OFFICER' as any,
    timestamp: '2024-01-15T09:30:00Z',
  },
];

const transactionTrendData = [
  { name: 'Mon', subsidy: 45, commercial: 30 },
  { name: 'Tue', subsidy: 52, commercial: 35 },
  { name: 'Wed', subsidy: 48, commercial: 32 },
  { name: 'Thu', subsidy: 55, commercial: 38 },
  { name: 'Fri', subsidy: 60, commercial: 40 },
  { name: 'Sat', subsidy: 50, commercial: 35 },
  { name: 'Sun', subsidy: 42, commercial: 28 },
];

export default function AnalyticsPage() {
  const [fraudAlerts] = useState<FraudAlert[]>(mockFraudAlerts);
  const [auditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  const getSeverityBadge = (severity: FraudAlert['severity']) => {
    const variants = {
      LOW: 'info',
      MEDIUM: 'warning',
      HIGH: 'error',
      CRITICAL: 'error',
    } as const;
    return <Badge variant={variants[severity]}>{severity}</Badge>;
  };

  const getStatusBadge = (status: FraudAlert['status']) => {
    const variants = {
      PENDING: 'warning',
      INVESTIGATING: 'info',
      RESOLVED: 'success',
      FALSE_POSITIVE: 'default',
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const fraudColumns = [
    { key: 'type', label: 'Type' },
    { key: 'severity', label: 'Severity' },
    { key: 'description', label: 'Description' },
    { key: 'detectedAt', label: 'Detected' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const auditColumns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'userName', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'entityType', label: 'Entity' },
    { key: 'entityId', label: 'Entity ID' },
  ];

  const fraudTableData = fraudAlerts.map((alert) => ({
    id: alert.id,
    type: alert.type.replace('_', ' '),
    severity: getSeverityBadge(alert.severity),
    description: alert.description,
    detectedAt: formatDate(alert.detectedAt),
    status: getStatusBadge(alert.status),
    actions: (
      <Button variant="outline" size="sm">
        View Details
      </Button>
    ),
  }));

  const auditTableData = auditLogs.map((log) => ({
    id: log.id,
    timestamp: formatDate(log.timestamp),
    userName: log.userName,
    action: log.action.replace('_', ' '),
    entityType: log.entityType,
    entityId: log.entityId,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Audits</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Transaction logs and fraud detection</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Transaction Trend Chart */}
      <Card title="Transaction Trend">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={transactionTrendData}>
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

      {/* Fraud Alerts */}
      <Card title="Fraud Detection Alerts">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="text-yellow-500" size={20} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {fraudAlerts.length} active alerts
          </span>
        </div>
        <DataTable columns={fraudColumns} data={fraudTableData} />
      </Card>

      {/* Audit Logs */}
      <Card title="Audit Logs">
        <div className="mb-4 flex gap-3">
          <input
            type="date"
            value={dateFilter.start}
            onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
          <input
            type="date"
            value={dateFilter.end}
            onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
          />
          <Button variant="outline">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
        <DataTable columns={auditColumns} data={auditTableData} />
      </Card>
    </div>
  );
}
