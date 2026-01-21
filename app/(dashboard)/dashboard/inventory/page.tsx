'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInventories, updateInventory, syncInventory } from '@/store/slices/inventorySlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, Minus, RefreshCw, AlertTriangle } from 'lucide-react';
import { FuelType } from '@/types';
import { formatLiters, formatDate } from '@/utils/format';
import { useToast } from '@/components/providers/ToastProvider';
import { useState } from 'react';

export default function InventoryPage() {
  const dispatch = useAppDispatch();
  const { inventories, loading } = useAppSelector((state) => state.inventory);
  const { showToast } = useToast();
  const [updateModal, setUpdateModal] = useState<{
    open: boolean;
    stationId: string;
    fuelType: FuelType;
    action: 'ADD' | 'DEDUCT';
  } | null>(null);
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    dispatch(fetchInventories());
  }, [dispatch]);

  const handleUpdate = async () => {
    if (!updateModal || !quantity) return;
    
    try {
      await dispatch(
        updateInventory({
          stationId: updateModal.stationId,
          fuelType: updateModal.fuelType,
          quantity: Number(quantity),
          action: updateModal.action,
        })
      ).unwrap();
      showToast('Inventory updated successfully', 'success');
      setUpdateModal(null);
      setQuantity('');
      // Refresh the inventory list
      dispatch(fetchInventories());
    } catch (error: any) {
      showToast(error.message || 'Failed to update inventory', 'error');
    }
  };

  const handleSync = async (stationId: string) => {
    try {
      await dispatch(syncInventory(stationId)).unwrap();
      showToast('Inventory synced successfully', 'success');
      // Refresh the inventory list
      dispatch(fetchInventories());
    } catch (error: any) {
      showToast(error.message || 'Failed to sync inventory', 'error');
    }
  };

  const getSyncStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'error' | 'warning'> = {
      SYNCED: 'success',
      PENDING: 'warning',
      FAILED: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage station inventory levels</p>
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setUpdateModal({
                              open: true,
                              stationId: inventory.stationId,
                              fuelType: FuelType.PETROL,
                              action: 'ADD',
                            })
                          }
                        >
                          <Plus size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setUpdateModal({
                              open: true,
                              stationId: inventory.stationId,
                              fuelType: FuelType.PETROL,
                              action: 'DEDUCT',
                            })
                          }
                        >
                          <Minus size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSync(inventory.stationId)}
                        >
                          <RefreshCw size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Card>

      <Modal
        isOpen={updateModal?.open || false}
        onClose={() => setUpdateModal(null)}
        title={`${updateModal?.action === 'ADD' ? 'Add' : 'Deduct'} ${updateModal?.fuelType} Stock`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantity (Liters)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter quantity"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUpdateModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              {updateModal?.action === 'ADD' ? 'Add' : 'Deduct'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
