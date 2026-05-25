'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, Download, TrendingUp, Fuel, Wallet, CalendarRange, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { transactionFunctions } from '@/supabase';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/format';

type IntervalType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export default function ReportsBranchPage() {
  const { user } = useAppSelector((state: any) => state.auth || {});

  const [selectedInterval, setSelectedInterval] = useState<IntervalType>('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayLiters, setTodayLiters] = useState(0);
  const [todayTransactionsCount, setTodayTransactionsCount] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.stationId) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch today's transactions
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const result = await transactionFunctions.getTransactions({
        stationId: user.stationId,
        startDate: startOfDay.toISOString(),
      });

      const txs = result.data || [];
      setRecentTransactions(txs);

      let revenueSum = 0;
      let litersSum = 0;
      let count = 0;

      txs.forEach((tx: any) => {
        if (tx.status === 'SUCCESS') {
          revenueSum += Number(tx.amount || 0);
          litersSum += Number(tx.liters || 0);
          count += 1;
        }
      });

      setTodayRevenue(revenueSum);
      setTodayLiters(litersSum);
      setTodayTransactionsCount(count);
    } catch (err: any) {
      setError(err.message || 'Failed to load branch reports');
    } finally {
      setLoading(false);
    }
  }, [user?.stationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const intervals: { label: string; key: IntervalType }[] = [
    { label: 'Today', key: 'day' },
    { label: 'Weekly', key: 'week' },
    { label: 'Monthly', key: 'month' },
    { label: 'Quarterly', key: 'quarter' },
    { label: 'Annual', key: 'year' },
    { label: 'Custom', key: 'custom' },
  ];

  const handleDownload = (title: string) => {
    const period = selectedInterval === 'custom' ? `${startDate || 'N/A'} to ${endDate || 'N/A'}` : selectedInterval;
    alert(`Downloading "${title}" for ${period} period...`);
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_BRANCH}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Branch Reports</h1>
            <p className="text-slate-500 font-medium mt-2">Daily sales, inventory, and shift fulfillment reports</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={loadData} disabled={loading}>
              <RefreshCw size={18} className={cn(loading && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="shadow-blue-500/20 hover:shadow-xl transition-all gap-2"
              onClick={() => handleDownload('Full Branch Report')}
            >
              <Download size={20} strokeWidth={3} />
              Export All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Today\'s Revenue', value: formatCurrency(todayRevenue), icon: Wallet, color: 'blue' },
              { label: 'Fuel Dispensed', value: `${todayLiters.toLocaleString()} L`, icon: Fuel, color: 'emerald' },
              { label: 'Transactions', value: String(todayTransactionsCount), icon: TrendingUp, color: 'purple' },
            ].map((s) => (
              <Card key={s.label} className="p-6 border-none shadow-xl relative overflow-hidden group bg-white dark:bg-slate-900">
                <div className={cn(
                  'p-3 rounded-2xl w-fit mb-4 transition-transform group-hover:scale-110',
                  s.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                  s.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                  'bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                )}>
                  <s.icon size={22} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{s.value}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Interval Selector */}
        <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 mb-6">
            <CalendarRange className="text-blue-600" size={22} />
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Download Report</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {intervals.map((iv) => (
              <button
                key={iv.key}
                onClick={() => setSelectedInterval(iv.key)}
                className={cn(
                  'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all',
                  selectedInterval === iv.key
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-300 dark:hover:border-blue-700'
                )}
              >
                {iv.label}
              </button>
            ))}
          </div>

          {selectedInterval === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {['Sales Reconciliation', 'Shift Fulfillment', 'Fuel Dispensing', 'Cash Float'].map((r) => (
              <Button key={r} variant="outline" className="font-black gap-2 border-2" onClick={() => handleDownload(r)}>
                <Download size={14} />
                {r}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={22} />
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Today's Transactions Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  {['Reference', 'User', 'Liters', 'Amount', 'Status', 'Time'].map((h) => (
                    <th key={h} className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm font-bold text-slate-400">Loading today's transactions...</td>
                  </tr>
                ) : recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm font-bold text-slate-400">No transactions recorded today</td>
                  </tr>
                ) : (
                  recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 text-sm font-black text-slate-900 dark:text-white">{tx.reference_number || tx.id?.slice(0, 8)}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-600 dark:text-slate-300">{tx.user?.name || 'Customer'}</td>
                      <td className="py-4 px-6 text-sm font-black text-slate-900 dark:text-white">{tx.liters} L</td>
                      <td className="py-4 px-6 text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrency(tx.amount)}</td>
                      <td className="py-4 px-6">
                        <Badge variant={tx.status === 'SUCCESS' ? 'success' : 'error'} size="sm" className="font-black">
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-bold">{new Date(tx.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
