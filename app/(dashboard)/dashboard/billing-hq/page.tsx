'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Receipt, ArrowRight, CreditCard, Clock, CheckCircle2, Loader2, AlertCircle, FileText, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { billingFunctions } from '@/supabase';

export default function BillingHQPage() {
  const [billingRecords, setBillingRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadBilling = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await billingFunctions.getBillingRecords({});
      setBillingRecords(result.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load billing records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  const handleMarkPaid = async (id: string) => {
    setProcessing(id);
    try {
      await billingFunctions.markAsPaid(id);
      await loadBilling();
    } catch (err: any) {
      setError(err.message || 'Failed to mark as paid');
    } finally {
      setProcessing(null);
    }
  };

  const totalSettled = billingRecords
    .filter(r => r.payment_status === 'PAID')
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

  const totalPending = billingRecords
    .filter(r => r.payment_status !== 'PAID')
    .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

  const settled = billingRecords.filter(r => r.payment_status === 'PAID').length;
  const pending = billingRecords.filter(r => r.payment_status !== 'PAID').length;

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_HQ}>
      <div className="space-y-12 pb-20">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Ledger & Settlement</h1>
          <p className="text-slate-500 font-medium mt-2">Centralized institutional invoicing and automated reconciliation for government entities</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
            <AlertCircle className="text-rose-500 shrink-0" size={20} />
            <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs font-black uppercase">Dismiss</button>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 border-none shadow-2xl bg-blue-600 text-white relative overflow-hidden group rounded-[2rem]">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Settled</p>
              {loading ? <Loader2 className="animate-spin" size={24} /> : <h3 className="text-3xl font-black">{formatCurrency(totalSettled)}</h3>}
              <p className="text-xs font-bold mt-4 flex items-center gap-1 opacity-80"><CheckCircle2 size={14} /> {settled} invoices paid</p>
            </div>
            <Receipt className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform" />
          </Card>
          <Card className="p-8 border-none shadow-2xl bg-amber-500 text-white relative overflow-hidden group rounded-[2rem]">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Aging Reserve</p>
              {loading ? <Loader2 className="animate-spin" size={24} /> : <h3 className="text-3xl font-black">{formatCurrency(totalPending)}</h3>}
              <p className="text-xs font-bold mt-4 flex items-center gap-1 opacity-80"><Clock size={14} /> {pending} invoices pending</p>
            </div>
            <Clock className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform" />
          </Card>
          <Card className="p-8 border-none shadow-2xl bg-emerald-600 text-white relative overflow-hidden group rounded-[2rem]">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Integrity Sync</p>
              <h3 className="text-3xl font-black">{loading ? '...' : billingRecords.length > 0 ? '100%' : 'N/A'}</h3>
              <p className="text-xs font-bold mt-4 flex items-center gap-1 opacity-80"><CheckCircle2 size={14} /> All Validated</p>
            </div>
            <CheckCircle2 className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform" />
          </Card>
        </div>

        {/* Billing Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : billingRecords.length === 0 ? (
          <Card className="p-16 border-none shadow-3xl relative overflow-hidden group bg-white dark:bg-slate-900 rounded-[3rem]">
            <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-10">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-500/40 flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border-4 border-white/10">
                <Receipt size={48} strokeWidth={2.5} />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">No Billing Records</h2>
                <p className="text-slate-500 text-xl font-medium leading-relaxed opacity-80">
                  No billing records found. They will appear here once invoices are generated.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 pt-6 w-full">
                <Button variant="primary" size="lg" className="h-20 px-12 rounded-[1.5rem] text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 group hover:shadow-blue-500/40 active:scale-95 transition-all">
                  Generate Cycle Invoices
                  <ArrowRight size={22} className="ml-3 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                </Button>
                <Button variant="outline" size="lg" className="h-20 px-12 rounded-[1.5rem] text-base font-black uppercase tracking-[0.2em] border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                  Aging Reports
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border-none shadow-2xl overflow-hidden rounded-[2rem]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <FileText className="text-blue-600" size={22} />
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Billing Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                  <tr>
                    {['Invoice', 'Station', 'Department', 'Period', 'Amount', 'Status', 'Action'].map((h) => (
                      <th key={h} className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {billingRecords.map((r: any) => (
                    <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-black text-blue-600 text-sm">{r.invoice_number || r.id?.slice(0, 8)}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-700 dark:text-slate-300">{r.station?.name || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-500">{r.department?.name || 'N/A'}</td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-400">
                        {r.billing_period_start ? new Date(r.billing_period_start).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 font-black text-slate-900 dark:text-white">{formatCurrency(Number(r.total_amount))}</td>
                      <td className="py-4 px-6">
                        <Badge variant={r.payment_status === 'PAID' ? 'success' : 'warning'} size="sm" className="font-black">
                          {r.payment_status || 'INVOICED'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        {r.payment_status !== 'PAID' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={processing === r.id}
                            onClick={() => handleMarkPaid(r.id)}
                            className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 dark:hover:bg-emerald-900/20 gap-1"
                          >
                            {processing === r.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
