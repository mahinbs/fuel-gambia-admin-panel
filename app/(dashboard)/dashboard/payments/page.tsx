'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPayments, retryPayment, processRefund, fetchPaymentById } from '@/store/slices/paymentsSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, RefreshCw, DollarSign, Eye } from 'lucide-react';
import { PaymentStatus } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { useToast } from '@/components/providers/ToastProvider';

export default function PaymentsPage() {
  const dispatch = useAppDispatch();
  const { payments, selectedPayment, total, loading } = useAppSelector((state) => state.payments);
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModal, setDetailModal] = useState(false);

  useEffect(() => {
    dispatch(
      fetchPayments({
        page: currentPage,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
    );
  }, [dispatch, currentPage, statusFilter, startDate, endDate]);

  const handleRetry = async (id: string) => {
    try {
      await dispatch(retryPayment(id)).unwrap();
      showToast('Payment retry initiated', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to retry payment', 'error');
    }
  };

  const handleRefund = async (id: string) => {
    if (!confirm('Are you sure you want to process a refund?')) return;
    try {
      await dispatch(processRefund(id)).unwrap();
      showToast('Refund processed successfully', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to process refund', 'error');
    }
  };

  const handleViewDetails = async (id: string) => {
    await dispatch(fetchPaymentById(id));
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

  const totalRevenue = payments
    .filter((p) => p.status === PaymentStatus.SUCCESS)
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = payments.filter((p) => p.status === PaymentStatus.PENDING).length;
  const failedPayments = payments.filter((p) => p.status === PaymentStatus.FAILED).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage payment transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{pendingPayments}</p>
            </div>
            <RefreshCw className="text-yellow-600" size={32} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{failedPayments}</p>
            </div>
            <DollarSign className="text-red-600" size={32} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Status</option>
            <option value={PaymentStatus.SUCCESS}>Success</option>
            <option value={PaymentStatus.PENDING}>Pending</option>
            <option value={PaymentStatus.FAILED}>Failed</option>
            <option value={PaymentStatus.REFUNDED}>Refunded</option>
          </select>
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
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
                  <TableHeader>User</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Fuel Type</TableHeader>
                  <TableHeader>Payment Method</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Retry Count</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDateTime(payment.createdAt)}</TableCell>
                    <TableCell>{payment.userName || payment.userId}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{payment.fuelType}</TableCell>
                    <TableCell>{payment.paymentMethod || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{payment.retryCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(payment.id)}
                        >
                          <Eye size={16} />
                        </Button>
                        {payment.status === PaymentStatus.FAILED && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetry(payment.id)}
                          >
                            <RefreshCw size={16} />
                          </Button>
                        )}
                        {payment.status === PaymentStatus.SUCCESS && !payment.refunded && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefund(payment.id)}
                          >
                            <DollarSign size={16} />
                          </Button>
                        )}
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
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title="Payment Details"
        size="lg"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment ID</p>
                <p className="font-medium">{selectedPayment.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                <p className="font-medium">{formatDateTime(selectedPayment.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                <p className="font-medium">{formatCurrency(selectedPayment.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <p className="font-medium">{getStatusBadge(selectedPayment.status)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method</p>
                <p className="font-medium">{selectedPayment.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Retry Count</p>
                <p className="font-medium">{selectedPayment.retryCount}</p>
              </div>
            </div>
            {selectedPayment.gatewayResponse && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Gateway Response</p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(selectedPayment.gatewayResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
