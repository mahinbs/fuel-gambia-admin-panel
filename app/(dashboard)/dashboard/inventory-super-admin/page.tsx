'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInventories } from '@/store/slices/inventorySlice';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertTriangle, Eye } from 'lucide-react';
import { formatLiters, formatDate } from '@/utils/format';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function InventorySuperAdminPage() {
  const dispatch = useAppDispatch();
  const { inventories, loading } = useAppSelector((state) => state.inventory);

  useEffect(() => {
    dispatch(fetchInventories());
  }, [dispatch]);

  const getSyncStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'error' | 'warning'> = {
      SYNCED: 'success',
      PENDING: 'warning',
      FAILED: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Overview - Super Admin</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View inventory levels across all stations</p>
        </div>

        <Card>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} height={60} />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Station</TableHeader>
                    <TableHeader>Petrol Stock</TableHeader>
                    <TableHeader>Diesel Stock</TableHeader>
                    <TableHeader>Sync Status</TableHeader>
                    <TableHeader>Last Updated</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventories.map((inventory) => (
                    <TableRow key={inventory.stationId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {inventory.petrolStock < 1000 || inventory.dieselStock < 1000 ? (
                            <AlertTriangle className="text-yellow-500" size={16} />
                          ) : null}
                          {inventory.stationName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {formatLiters(inventory.petrolStock)}
                          {inventory.petrolStock < 1000 && (
                            <Badge variant="warning" size="sm">Low</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {formatLiters(inventory.dieselStock)}
                          {inventory.dieselStock < 1000 && (
                            <Badge variant="warning" size="sm">Low</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getSyncStatusBadge(inventory.syncStatus)}</TableCell>
                      <TableCell>{formatDate(inventory.lastUpdated)}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/stations/${inventory.stationId}`}>
                          <Button variant="ghost" size="sm">
                            <Eye size={16} />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </Card>
      </div>
    </ProtectedRoute>
  );
}
