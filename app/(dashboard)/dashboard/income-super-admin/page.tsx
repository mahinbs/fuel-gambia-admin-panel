'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { DollarSign, Download, TrendingUp, ArrowUpRight, Building2, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole, Payment, PaymentStatus } from '@/types';
import { paymentsService } from '@/services/paymentsService';

export default function IncomeSuperAdminPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      // Fetch the first page of payments (covers the latest transactions)
      const response = await paymentsService.getPayments({ page: 1 });
      setPayments(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch payments data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Compute metrics dynamically from live payments database
  const totalIncome = payments
    .filter(p => p.status === PaymentStatus.SUCCESS)
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingIncome = payments
    .filter(p => p.status === PaymentStatus.PENDING)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalProcessed = payments
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCount = payments.filter(p => p.status === PaymentStatus.PENDING).length;

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Financial Oversight</h1>
            <p className="text-slate-500 font-medium mt-2">Monitor national fuel subsidy income and institutional payments</p>
          </div>
        </div>

        {isLoading && payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading financial records...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden group border-none bg-gradient-to-br from-blue-600 to-indigo-700 p-8 shadow-blue-500/20 shadow-xl rounded-[2.5rem]">
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <DollarSign className="text-white" size={24} />
                    </div>
                  </div>
                  <div className="mt-8">
                    <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1 opacity-80">Total Income (MTD)</p>
                    <p className="text-4xl font-black text-white tracking-tight">{formatCurrency(totalIncome)}</p>
                  </div>
                </div>
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              </Card>

              <Card className="relative overflow-hidden group border-none bg-white dark:bg-slate-900 p-8 shadow-2xl rounded-[2.5rem]">
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl transition-transform group-hover:rotate-6 duration-300">
                      <TrendingUp className="text-amber-600 dark:text-amber-400" size={24} />
                    </div>
                    <Badge variant="warning" size="sm" className="font-black">{pendingCount} Pending</Badge>
                  </div>
                  <div className="mt-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Receivables</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(pendingIncome)}</p>
                  </div>
                </div>
              </Card>

              <Card className="relative overflow-hidden group border-none bg-white dark:bg-slate-900 p-8 shadow-2xl rounded-[2.5rem]">
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl transition-transform group-hover:-rotate-6 duration-300">
                      <CreditCard className="text-emerald-600 dark:text-emerald-400" size={24} />
                    </div>
                    <Badge variant="success" size="sm" className="font-black">Clearance</Badge>
                  </div>
                  <div className="mt-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Processed Gross</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalProcessed)}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card title="Institutional Transaction Ledger" className="p-0 overflow-hidden border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHead className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow>
                      <TableHeader className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Partner User</TableHeader>
                      <TableHeader className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Gross Amount</TableHeader>
                      <TableHeader className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Date</TableHeader>
                      <TableHeader className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Channel</TableHeader>
                      <TableHeader className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Clearance Status</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          No transactions found in database ledger.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((t) => (
                        <TableRow key={t.id} className="group hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                          <TableCell className="py-6 px-8 font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                              <Building2 size={20} />
                            </div>
                            {t.userName || 'Unknown User'}
                          </TableCell>
                          <TableCell className="py-6 px-8 text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            {formatCurrency(t.amount)}
                          </TableCell>
                          <TableCell className="py-6 px-8 text-xs font-bold text-slate-400">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} /> {t.createdAt ? t.createdAt.split('T')[0] : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-8 text-xs font-black text-slate-500 uppercase tracking-widest italic">
                            {t.paymentMethod || 'Mobile Money'}
                          </TableCell>
                          <TableCell className="py-6 px-8 text-right">
                            <Badge variant={t.status === PaymentStatus.SUCCESS ? 'success' : 'warning'} size="sm" className="font-black px-3 py-1 rounded-lg">
                              {t.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
