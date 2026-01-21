'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Search, Eye } from 'lucide-react';
import { formatDateTime } from '@/utils/format';

// Mock QR audit data
const mockQRAudits = [
  {
    id: '1',
    qrCode: 'QR_ABC123',
    payload: { userId: 'user_1', mode: 'SUBSIDY' },
    scannedBy: 'Attendant 1',
    stationId: 'station_1',
    stationName: 'Station A',
    redeemed: true,
    redemptionTimestamp: new Date().toISOString(),
    fuelDispensed: 20,
    balanceChange: -500,
    createdAt: new Date().toISOString(),
  },
];

export default function QRAuditPage() {
  const [search, setSearch] = useState('');
  const [audits] = useState(mockQRAudits);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">QR Audit</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Audit QR code scans and redemptions</p>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Search QR codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>QR Code</TableHeader>
              <TableHeader>Payload</TableHeader>
              <TableHeader>Scanned By</TableHeader>
              <TableHeader>Station</TableHeader>
              <TableHeader>Redeemed</TableHeader>
              <TableHeader>Fuel Dispensed</TableHeader>
              <TableHeader>Balance Change</TableHeader>
              <TableHeader>Timestamp</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell>{audit.qrCode}</TableCell>
                <TableCell>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {JSON.stringify(audit.payload, null, 2)}
                  </pre>
                </TableCell>
                <TableCell>{audit.scannedBy}</TableCell>
                <TableCell>{audit.stationName}</TableCell>
                <TableCell>
                  <Badge variant={audit.redeemed ? 'success' : 'default'}>
                    {audit.redeemed ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>{audit.fuelDispensed ? `${audit.fuelDispensed}L` : 'N/A'}</TableCell>
                <TableCell>{audit.balanceChange ? `GMD ${audit.balanceChange}` : 'N/A'}</TableCell>
                <TableCell>{formatDateTime(audit.createdAt)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
