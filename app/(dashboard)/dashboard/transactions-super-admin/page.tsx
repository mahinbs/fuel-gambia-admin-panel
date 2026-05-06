'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTransactions, fetchTransactionById } from '@/store/slices/transactionsSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { Download, Eye, Fuel, ArrowRight } from 'lucide-react';
import { TransactionMode, PaymentStatus, FuelType, Transaction } from '@/types';
import { formatCurrency, formatDateTime, formatLiters } from '@/utils/format';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function TransactionsSuperAdminPage() {
  const dispatch = useAppDispatch();
  const { transactions, selectedTransaction, total, loading } = useAppSelector((state) => state.transactions);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModal, setDetailModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions({ page: currentPage }));
  }, [dispatch, currentPage]);

  const handleViewDetails = async (id: string) => {
    await dispatch(fetchTransactionById(id));
    setDetailModal(true);
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Date & Time',
      sortable: true,
      render: (val: string) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">{formatDateTime(val).split(' ')[0]}</span>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{formatDateTime(val).split(' ').slice(1).join(' ')}</span>
        </div>
      ),
    },
    {
      key: 'userName',
      label: 'User / Entity',
      render: (val: string, row: Transaction) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-black text-[10px]">
            {val?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white">{val || 'Anonymous'}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{row.companyName || 'Private'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'stationName',
      label: 'Station / Branch',
      render: (val: string, row: Transaction) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">{val || 'N/A'}</span>
          <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 w-fit mt-1">
            CODE: {row.branchCode || '---'}
          </span>
        </div>
      ),
    },
    {
      key: 'fuelType',
      label: 'Fuel Type',
      render: (val: FuelType) => (
        <Badge variant="info" className="font-black uppercase tracking-wider text-[9px] px-2 py-0.5">
          {val}
        </Badge>
      ),
    },
    {
      key: 'amount',
      label: 'Total Amount',
      sortable: true,
      render: (val: number) => (
        <span className="font-black text-slate-900 dark:text-white">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'liters',
      label: 'Volume',
      render: (val: number) => (
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-bold">
          <Fuel size={14} className="text-slate-400" />
          {formatLiters(val)}
        </div>
      ),
    },
    {
      key: 'mode',
      label: 'Method',
      render: (val: TransactionMode) => (
        <Badge 
          variant={val === TransactionMode.SUBSIDY ? 'success' : 'info'} 
          className="font-black uppercase tracking-wider text-[9px] px-2 py-0.5"
        >
          {val}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val: PaymentStatus) => {
        const colors = {
          [PaymentStatus.SUCCESS]: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
          [PaymentStatus.PENDING]: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
          [PaymentStatus.FAILED]: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
          [PaymentStatus.CANCELLED]: 'bg-slate-400',
          [PaymentStatus.REFUNDED]: 'bg-blue-400',
        };
        return (
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", colors[val])} />
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">{val}</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: Transaction) => (
        <button 
          onClick={() => handleViewDetails(row.id)}
          className="p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors"
        >
          <Eye size={18} strokeWidth={2.5} />
        </button>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Transactions Audit</h1>
            <p className="text-slate-500 font-medium mt-2">Monitor nationwide fuel disbursement in real-time</p>
          </div>
          <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900 shadow-sm font-black text-xs uppercase tracking-widest">
            <Download size={16} className="mr-2" strokeWidth={3} />
            Export Audit Log
          </Button>
        </div>

        <Card className="p-0 border-none shadow-2xl overflow-visible bg-transparent">
          <DataTable
            columns={columns}
            data={transactions}
            searchable
            searchPlaceholder="Search by user, company, or station..."
            className="bg-transparent"
          />
          
          <div className="flex items-center justify-between mt-8 px-8 pb-8">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {transactions.length} of {total} transactions
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={transactions.length < 20}
                className="rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                Next
                <ArrowRight size={14} className="ml-2" />
              </Button>
            </div>
          </div>
        </Card>

        {selectedTransaction && (
          <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title="Transaction Manifest">
            <div className="space-y-8 p-2">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Reference</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{selectedTransaction.id}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Disbursement Date</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{formatDateTime(selectedTransaction.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiary</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedTransaction.userName || 'N/A'}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fueling Station</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedTransaction.stationName || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuel Category</p>
                  <Badge variant="info" className="font-black mt-1">{selectedTransaction.fuelType}</Badge>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Valuation</p>
                  <p className="text-lg font-black text-blue-600">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Dispensed</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{formatLiters(selectedTransaction.liters)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                    <Badge variant="success" className="font-black mt-1 uppercase">{selectedTransaction.mode}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </ProtectedRoute>
  );
}
