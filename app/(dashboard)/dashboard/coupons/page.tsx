'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { Coupon, FuelType } from '@/types';
import { formatCurrency, formatLiters, formatDate } from '@/utils/format';
import { Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const mockCoupons: Coupon[] = [
  {
    id: '1',
    beneficiaryId: 'b1',
    beneficiaryName: 'John Doe',
    fuelType: FuelType.PETROL,
    amount: 6500,
    liters: 100,
    remainingBalance: 3250,
    status: 'ACTIVE',
    issuedAt: '2024-01-01T00:00:00Z',
    expiresAt: '2024-01-31T23:59:59Z',
  },
  {
    id: '2',
    beneficiaryId: 'b2',
    beneficiaryName: 'Jane Smith',
    fuelType: FuelType.DIESEL,
    amount: 10200,
    liters: 150,
    remainingBalance: 0,
    status: 'USED',
    issuedAt: '2024-01-01T00:00:00Z',
    expiresAt: '2024-01-31T23:59:59Z',
    usedAt: '2024-01-15T10:30:00Z',
  },
];

export default function CouponsPage() {
  const [coupons] = useState<Coupon[]>(mockCoupons);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredCoupons = statusFilter
    ? coupons.filter((c) => c.status === statusFilter)
    : coupons;

  const getStatusBadge = (status: Coupon['status']) => {
    const variants = {
      ACTIVE: 'success',
      USED: 'info',
      EXPIRED: 'warning',
      CANCELLED: 'error',
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const columns = [
    { key: 'beneficiaryName', label: 'Beneficiary' },
    { key: 'fuelType', label: 'Fuel Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'liters', label: 'Liters' },
    { key: 'remainingBalance', label: 'Remaining' },
    { key: 'status', label: 'Status' },
    { key: 'issuedAt', label: 'Issued' },
    { key: 'expiresAt', label: 'Expires' },
    { key: 'actions', label: 'Actions' },
  ];

  const tableData = filteredCoupons.map((coupon) => ({
    id: coupon.id,
    beneficiaryName: coupon.beneficiaryName,
    fuelType: <Badge variant="info">{coupon.fuelType}</Badge>,
    amount: formatCurrency(coupon.amount),
    liters: formatLiters(coupon.liters),
    remainingBalance: formatCurrency(coupon.remainingBalance),
    status: getStatusBadge(coupon.status),
    issuedAt: formatDate(coupon.issuedAt),
    expiresAt: formatDate(coupon.expiresAt),
    actions: (
      <div className="flex gap-2">
        <button className="text-blue-600 hover:text-blue-800">
          <Eye size={16} />
        </button>
        <button className="text-green-600 hover:text-green-800">
          <Download size={16} />
        </button>
      </div>
    ),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Coupon Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage issued coupons</p>
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="USED">Used</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <Card>
        <DataTable columns={columns} data={tableData} />
      </Card>
    </div>
  );
}
