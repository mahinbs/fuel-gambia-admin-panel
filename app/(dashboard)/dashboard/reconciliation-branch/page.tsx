'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Wallet, Save, RefreshCw, CheckCircle2, AlertCircle, TrendingUp, CreditCard, Coins, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { reconciliationFunctions, transactionFunctions } from '@/supabase';
import { useAppSelector } from '@/store/hooks';

export default function ReconciliationBranchPage() {
  const { user } = useAppSelector((state: any) => state.auth || {});

  // Reconciliation form state
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [fuelType, setFuelType] = useState<'PETROL' | 'DIESEL'>('PETROL');
  const [physicalStock, setPhysicalStock] = useState('');

  // Daily totals computed from transactions
  const [cashSales, setCashSales] = useState(0);
  const [couponSales, setCouponSales] = useState(0);
  const [mobileSales, setMobileSales] = useState(0);

  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.stationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // Fetch reconciliations
      const recs = await reconciliationFunctions.getReconciliations({ stationId: user.stationId });
      setReconciliations(recs || []);

      // Fetch today's transactions to compute daily sales figures
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: txs } = await transactionFunctions.getTransactions({
        stationId: user.stationId,
        startDate: today.toISOString(),
      });

      let cashSum = 0;
      let couponSum = 0;
      let mobileSum = 0;

      (txs || []).forEach((tx: any) => {
        if (tx.status === 'SUCCESS') {
          if (tx.mode === 'SUBSIDY') {
            couponSum += Number(tx.amount || 0);
          } else if (tx.mode === 'PAID') {
            // Check transaction notes or payment method if available
            // Default to cash or divide based on payment method
            const method = tx.payment_method || 'Cash';
            if (method.toLowerCase() === 'cash') {
              cashSum += Number(tx.amount || 0);
            } else {
              mobileSum += Number(tx.amount || 0);
            }
          }
        }
      });

      setCashSales(cashSum);
      setCouponSales(couponSum);
      setMobileSales(mobileSum);

    } catch (err: any) {
      setError(err.message || 'Failed to load reconciliation logs');
    } finally {
      setLoading(false);
    }
  }, [user?.stationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!physicalStock) {
      alert('Please enter the physical closing stock.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await reconciliationFunctions.calculateReconciliation({
        stationId: user.stationId,
        periodMonth: Number(month),
        periodYear: Number(year),
        fuelType,
        closingStockPhysical: Number(physicalStock),
        reconciledBy: user.id
      });
      setSuccess(`Reconciliation calculated and submitted successfully for ${fuelType} - ${month}/${year}!`);
      setPhysicalStock('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit reconciliation figures');
    } finally {
      setSubmitting(false);
    }
  };

  const totalDailySales = cashSales + couponSales + mobileSales;

  // Find any shortage in past reconciliations
  const shortages = reconciliations.filter(r => r.shortage_liters > 0);

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_BRANCH}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Stock & Sales Reconciliation</h1>
            <p className="text-slate-500 font-medium mt-2">Reconcile physical fuel stocks and verify daily system transactions</p>
          </div>
          <Badge variant="info" className="h-10 px-4 font-black text-sm">
            {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </Badge>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
            <AlertCircle className="text-rose-500 shrink-0" size={20} />
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs font-black uppercase">Dismiss</button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-400 hover:text-emerald-600 text-xs font-black uppercase">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6 flex items-center gap-2">
                <Wallet className="text-blue-600" size={22} />
                Calculate Monthly Stock Reconciliation
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Month</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString(undefined, { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    >
                      {[2025, 2026, 2027].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Fuel Type</label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as any)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="PETROL">Petrol</option>
                      <option value="DIESEL">Diesel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Physical Closing Stock (Liters)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={physicalStock}
                      onChange={(e) => setPhysicalStock(e.target.value)}
                      placeholder="e.g. 15400"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Action</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">This runs the calculation RPC to check for shortage variances</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      className="gap-2 border-slate-200"
                      onClick={() => setPhysicalStock('')}
                    >
                      <RefreshCw size={16} />
                      Clear
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={submitting}
                      className="gap-2 shadow-xl shadow-blue-500/20 font-black"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                      Reconcile Stock
                    </Button>
                  </div>
                </div>
              </form>
            </Card>

            <Card className="border-none shadow-2xl overflow-hidden bg-white dark:bg-slate-900">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Reconciliation Ledger</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                    <tr>
                      {['Period', 'Fuel Type', 'Physical Stock', 'Theoretical Stock', 'Shortage', 'Sales (Cash/Coupon/Wallet)', 'Status'].map((h) => (
                        <th key={h} className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-sm font-bold text-slate-400">Loading ledger records...</td>
                      </tr>
                    ) : reconciliations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-sm font-bold text-slate-400">No reconciliation records found</td>
                      </tr>
                    ) : (
                      reconciliations.map((r, i) => (
                        <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-5 px-6 font-black text-slate-900 dark:text-white text-sm">{r.period_month}/{r.period_year}</td>
                          <td className="py-5 px-6 text-sm font-bold text-slate-600 dark:text-slate-300">{r.fuel_type}</td>
                          <td className="py-5 px-6 text-sm font-bold text-slate-700 dark:text-slate-300">{r.physical_closing?.toLocaleString() || '—'} L</td>
                          <td className="py-5 px-6 text-sm font-bold text-slate-700 dark:text-slate-300">{r.theoretical_closing?.toLocaleString()} L</td>
                          <td className={cn("py-5 px-6 text-sm font-black", r.shortage_liters > 0 ? "text-rose-600" : "text-emerald-600")}>
                            {r.shortage_liters?.toLocaleString()} L
                          </td>
                          <td className="py-5 px-6 text-xs text-slate-500 font-bold">
                            {formatCurrency(r.cash_sales)} / {formatCurrency(r.coupon_sales)} / {formatCurrency(r.mobile_money_sales)}
                          </td>
                          <td className="py-5 px-6">
                            <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'error' : 'info'} size="sm" className="font-black">
                              {r.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-8 border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Live Today's System Sales</p>
                <p className="text-4xl font-black mt-2 tracking-tight">{formatCurrency(totalDailySales)}</p>
                <div className="mt-6 pt-6 border-t border-white/20 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-blue-200 flex items-center gap-1.5"><Coins size={14} /> Cash:</span>
                    <span>{formatCurrency(cashSales)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-blue-200 flex items-center gap-1.5"><CreditCard size={14} /> Coupon Value:</span>
                    <span>{formatCurrency(couponSales)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-blue-200 flex items-center gap-1.5"><TrendingUp size={14} /> Mobile Money:</span>
                    <span>{formatCurrency(mobileSales)}</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
            </Card>

            <Card className="p-8 border-none shadow-xl bg-white dark:bg-slate-900">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle className="text-rose-500" size={18} /> Shortage / Variance Alerts
              </h3>
              {loading ? (
                <p className="text-xs text-slate-400 font-bold">Checking ledger alerts...</p>
              ) : shortages.length === 0 ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">No stock shortages or discrepancies found in recent monthly audits.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shortages.slice(0, 3).map((s, idx) => (
                    <div key={idx} className="p-5 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 space-y-2">
                      <p className="text-sm font-black text-rose-700 dark:text-rose-400">Shortage: {s.fuel_type} ({s.period_month}/{s.period_year})</p>
                      <p className="text-xs font-medium text-rose-600 dark:text-rose-500 leading-relaxed">
                        Shortage of {s.shortage_liters} liters detected. Reconciled shortage status is {s.status}.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
