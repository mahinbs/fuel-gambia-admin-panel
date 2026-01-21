'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTransactions, fetchTransactionById } from '@/store/slices/transactionsSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, Eye, Download } from 'lucide-react';
import { TransactionMode, PaymentStatus, FuelType } from '@/types';
import { formatCurrency, formatDateTime, formatLiters } from '@/utils/format';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function TransactionsStationManagerPage() {
  const dispatch = useAppDispatch();
  const { transactions, selectedTransaction, total, loading } = useAppSelector((state) => state.transactions);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModal, setDetailModal] = useState(false);

  useEffect(() => {
    dispatch(
      fetchTransactions({
        page: currentPage,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        // Station managers see transactions for their station only
      })
    );
  }, [dispatch, currentPage, startDate, endDate]);

  const handleViewDetails = async (id: string) => {
    await dispatch(fetchTransactionById(id));
    setDetailModal(true);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants = {
      [PaymentStatus.SUCCESS]: 'success',
      [PaymentStatus.PENDING]: 'warning',
      [PaymentStatus.FAILED]: 'error',
      [PaymentStatus.CANCELLED]: 'default',
      [PaymentStatus.REFUNDED]: 'info',
    } as const;
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_MANAGER}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction Monitoring</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View live transactions at your station</p>
          </div>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button variant="primary" onClick={() => setCurrentPage(1)}>
              Apply Filters
            </Button>
          </div>
        </Card>

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
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Customer</TableHeader>
                    <TableHeader>Fuel Type</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Liters</TableHeader>
                    <TableHeader>Mode</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                      <TableCell>{transaction.userName || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="info">{transaction.fuelType}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{formatLiters(transaction.liters)}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.mode === TransactionMode.SUBSIDY ? 'success' : 'info'}>
                          {transaction.mode}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(transaction.id)}>
                          <Eye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {transactions.length} of {total} transactions
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={transactions.length < 20}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {selectedTransaction && (
          <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title="Transaction Details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</p>
                  <p className="font-semibold">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-semibold">{formatDateTime(selectedTransaction.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                  <p className="font-semibold">{selectedTransaction.userName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Attendant</p>
                  <p className="font-semibold">{selectedTransaction.attendantName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fuel Type</p>
                  <p className="font-semibold">{selectedTransaction.fuelType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                  <p className="font-semibold">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Liters</p>
                  <p className="font-semibold">{formatLiters(selectedTransaction.liters)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <p className="font-semibold">{getStatusBadge(selectedTransaction.status)}</p>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ProtectedRoute>
  );
}
