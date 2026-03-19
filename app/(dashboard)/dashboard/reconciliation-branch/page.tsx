'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Wallet, Save, RefreshCw, CheckCircle2, AlertCircle, TrendingUp, CreditCard, Coins } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function ReconciliationBranchPage() {
  const [cashInput, setCashInput] = useState('');
  const [couponsInput, setCouponsInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');

  const total = (Number(cashInput) || 0) + (Number(couponsInput) || 0) + (Number(mobileInput) || 0);

  const reconciliations = [
    { date: '2026-03-15', cash: 12500, coupons: 8500, mobile: 15600, status: 'BALANCED' },
    { date: '2026-03-14', cash: 10800, coupons: 9200, mobile: 14200, status: 'BALANCED' },
    { date: '2026-03-13', cash: 13400, coupons: 7800, mobile: 16800, status: 'DISCREPANCY' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Daily Reconciliation</h1>
          <p className="text-slate-500 font-medium mt-2">Reconcile daily sales across cash, coupons, and mobile payments</p>
        </div>
        <Badge variant="info" className="h-10 px-4 font-black text-sm">March 18, 2026</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 border-none shadow-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6 flex items-center gap-2">
              <Wallet className="text-blue-600" size={22} />
              Submit Today's Figures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Cash (GMD)', icon: Coins, color: 'emerald', value: cashInput, setter: setCashInput },
                { label: 'Coupon Value (GMD)', icon: CreditCard, color: 'blue', value: couponsInput, setter: setCouponsInput },
                { label: 'Mobile Wallet (GMD)', icon: TrendingUp, color: 'purple', value: mobileInput, setter: setMobileInput },
              ].map((f) => (
                <div key={f.label}>
                  <label className={cn('block text-[10px] font-black uppercase tracking-widest mb-3',
                    f.color === 'emerald' ? 'text-emerald-600' : f.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                  )}>
                    {f.label}
                  </label>
                  <div className="relative group">
                    <f.icon className={cn(
                      'absolute left-4 top-1/2 -translate-y-1/2 transition-colors',
                      f.color === 'emerald' ? 'text-emerald-400' : f.color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                    )} size={18} />
                    <input
                      type="number"
                      value={f.value}
                      onChange={(e) => f.setter(e.target.value)}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Calculated Total</p>
                <p className="text-3xl font-black text-blue-700 dark:text-blue-300 mt-1">{formatCurrency(total)}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-slate-200"
                  onClick={() => { setCashInput(''); setCouponsInput(''); setMobileInput(''); }}
                >
                  <RefreshCw size={16} />
                  Clear
                </Button>
                <Button
                  variant="primary"
                  className="gap-2 shadow-xl shadow-blue-500/20 font-black"
                  onClick={() => alert(`Submitting figures: ${formatCurrency(total)}`)}
                >
                  <Save size={16} />
                  Submit Figures
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Previous Reconciliations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                  <tr>
                    {['Date', 'Cash', 'Coupons', 'Mobile', 'Status'].map((h) => (
                      <th key={h} className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reconciliations.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-5 px-6 font-black text-slate-900 dark:text-white text-sm">{r.date}</td>
                      <td className="py-5 px-6 text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(r.cash)}</td>
                      <td className="py-5 px-6 text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(r.coupons)}</td>
                      <td className="py-5 px-6 text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(r.mobile)}</td>
                      <td className="py-5 px-6">
                        <Badge variant={r.status === 'BALANCED' ? 'success' : 'error'} size="sm" className="font-black">
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-8 border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">System Total (Today)</p>
              <p className="text-4xl font-black mt-2 tracking-tight">{formatCurrency(36700)}</p>
              <div className="mt-6 pt-6 border-t border-white/20 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-200" />
                <span className="text-sm font-bold text-blue-100">Matches recorded transactions</span>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
          </Card>

          <Card className="p-8 border-none shadow-xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle className="text-rose-500" size={18} /> Discrepancy Alerts
            </h3>
            <div className="p-5 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 space-y-2">
              <p className="text-sm font-black text-rose-700 dark:text-rose-400">March 13 Discrepancy</p>
              <p className="text-xs font-medium text-rose-600 dark:text-rose-500 leading-relaxed">
                Shortfall of GMD 1,200 detected in cash vs system sales. Flagged for manager review.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
