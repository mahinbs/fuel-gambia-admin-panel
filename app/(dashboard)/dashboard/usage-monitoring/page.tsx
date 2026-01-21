'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatLiters, formatDate } from '@/utils/format';
import { Download, Filter } from 'lucide-react';
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

const mockUsageData = [
  {
    id: '1',
    beneficiaryName: 'John Doe',
    department: 'Health',
    allocated: 100,
    used: 75,
    remaining: 25,
    lastUsed: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    beneficiaryName: 'Jane Smith',
    department: 'Education',
    allocated: 150,
    used: 120,
    remaining: 30,
    lastUsed: '2024-01-14T15:30:00Z',
  },
];

const chartData = [
  { name: 'Week 1', used: 450, allocated: 500 },
  { name: 'Week 2', used: 520, allocated: 500 },
  { name: 'Week 3', used: 480, allocated: 500 },
  { name: 'Week 4', used: 550, allocated: 500 },
];

export default function UsageMonitoringPage() {
  const [usageData] = useState(mockUsageData);
  const [anomalies, setAnomalies] = useState<string[]>([]);

  const columns = [
    { key: 'beneficiaryName', label: 'Beneficiary' },
    { key: 'department', label: 'Department' },
    { key: 'allocated', label: 'Allocated' },
    { key: 'used', label: 'Used' },
    { key: 'remaining', label: 'Remaining' },
    { key: 'lastUsed', label: 'Last Used' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = usageData.map((item) => ({
    id: item.id,
    beneficiaryName: item.beneficiaryName,
    department: <Badge variant="info">{item.department}</Badge>,
    allocated: formatLiters(item.allocated),
    used: formatLiters(item.used),
    remaining: formatLiters(item.remaining),
    lastUsed: formatDate(item.lastUsed),
    actions: (
      <Button variant="outline" size="sm">
        View Details
      </Button>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usage Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time consumption view and department breakdown</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Usage Chart */}
      <Card title="Weekly Usage Trend">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
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

      {/* Anomalies */}
      {anomalies.length > 0 && (
        <Card title="Anomalies Detected">
          <div className="space-y-2">
            {anomalies.map((anomaly, index) => (
              <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">{anomaly}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Usage Table */}
      <Card title="Beneficiary Usage">
        <DataTable columns={columns} data={tableData} />
      </Card>
    </div>
  );
}
