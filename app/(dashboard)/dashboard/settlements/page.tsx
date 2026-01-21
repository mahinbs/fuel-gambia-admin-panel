'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { MonthlySettlement } from '@/types';
import { formatCurrency, formatLiters, formatDate } from '@/utils/format';
import { FileText, Send, CheckCircle } from 'lucide-react';

const mockSettlements: MonthlySettlement[] = [
  {
    id: '1',
    stationId: 's1',
    stationName: 'Gambia Fuel Station',
    month: '2024-01',
    totalLiters: 50000,
    totalAmount: 3250000,
    subsidyLiters: 30000,
    commercialLiters: 20000,
    status: 'SUBMITTED',
    submittedAt: '2024-02-01T00:00:00Z',
    transactions: [],
  },
  {
    id: '2',
    stationId: 's2',
    stationName: 'Serrekunda Fuel Depot',
    month: '2024-01',
    totalLiters: 45000,
    totalAmount: 2925000,
    subsidyLiters: 25000,
    commercialLiters: 20000,
    status: 'APPROVED',
    submittedAt: '2024-02-01T00:00:00Z',
    approvedBy: 'Super Admin',
    approvedAt: '2024-02-05T00:00:00Z',
    transactions: [],
  },
];

export default function SettlementsPage() {
  const [settlements] = useState<MonthlySettlement[]>(mockSettlements);

  const getStatusBadge = (status: MonthlySettlement['status']) => {
    const variants = {
      DRAFT: 'default',
      SUBMITTED: 'info',
      APPROVED: 'success',
      PAID: 'success',
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const handleSubmit = (id: string) => {
    if (confirm('Are you sure you want to submit this monthly report?')) {
      // Handle submission
      console.log('Submitting settlement:', id);
    }
  };

  const columns = [
    { key: 'stationName', label: 'Station' },
    { key: 'month', label: 'Month' },
    { key: 'totalLiters', label: 'Total Liters' },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'subsidyLiters', label: 'Subsidy Liters' },
    { key: 'commercialLiters', label: 'Commercial Liters' },
    { key: 'status', label: 'Status' },
    { key: 'submittedAt', label: 'Submitted' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = settlements.map((settlement) => ({
    id: settlement.id,
    stationName: settlement.stationName,
    month: settlement.month,
    totalLiters: formatLiters(settlement.totalLiters),
    totalAmount: formatCurrency(settlement.totalAmount),
    subsidyLiters: formatLiters(settlement.subsidyLiters),
    commercialLiters: formatLiters(settlement.commercialLiters),
    status: getStatusBadge(settlement.status),
    submittedAt: settlement.submittedAt ? formatDate(settlement.submittedAt) : '-',
    actions: (
      <div className="flex gap-2">
        {settlement.status === 'DRAFT' && (
          <Button variant="primary" size="sm" onClick={() => handleSubmit(settlement.id)}>
            <Send size={16} className="mr-1" />
            Submit
          </Button>
        )}
        <button className="text-blue-600 hover:text-blue-800">
          <FileText size={16} />
        </button>
        {settlement.status === 'APPROVED' && (
          <button className="text-green-600 hover:text-green-800">
            <CheckCircle size={16} />
          </button>
        )}
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Monthly Settlement</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Submit monthly reports and track payments</p>
        </div>
      </div>

      <Card>
        <DataTable columns={columns} data={tableData} />
      </Card>
    </div>
  );
}
