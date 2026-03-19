'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, Download, TrendingUp, Fuel, Wallet, CalendarRange, Filter } from 'lucide-react';
import { cn } from '@/utils/cn';

type IntervalType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export default function ReportsBranchPage() {
  const [selectedInterval, setSelectedInterval] = useState<IntervalType>('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const intervals: { label: string; key: IntervalType }[] = [
    { label: 'Today', key: 'day' },
    { label: 'Weekly', key: 'week' },
    { label: 'Monthly', key: 'month' },
    { label: 'Quarterly', key: 'quarter' },
    { label: 'Annual', key: 'year' },
    { label: 'Custom', key: 'custom' },
  ];

  const reports = [
    { id: '1', title: 'Daily Sales Reconciliation', date: 'Mar 15', type: 'PDF' },
    { id: '2', title: 'Shift Fulfillment Log', date: 'Mar 15', type: 'XLSX' },
    { id: '3', title: 'Fuel Dispensing Summary', date: 'Mar 14', type: 'PDF' },
    { id: '4', title: 'Cash Float Report', date: 'Mar 14', type: 'PDF' },
  ];

  const handleDownload = (title: string) => {
    const period = selectedInterval === 'custom' ? `${startDate || 'N/A'} to ${endDate || 'N/A'}` : selectedInterval;
    alert(`Downloading "${title}" for ${period} period...`);
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Branch Reports</h1>
          <p className="text-slate-500 font-medium mt-2">Daily sales, inventory, and shift fulfillment reports</p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Today\'s Revenue', value: 'D 36,700', icon: Wallet, color: 'blue' },
          { label: 'Fuel Dispensed', value: '2,100 L', icon: Fuel, color: 'emerald' },
          { label: 'Transactions', value: '148', icon: TrendingUp, color: 'purple' },
        ].map((s) => (
          <Card key={s.label} className="p-6 border-none shadow-xl relative overflow-hidden group">
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

      {/* Interval Selector */}
      <Card className="p-8 border-none shadow-2xl">
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

      <Card className="border-none shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <FileText className="text-blue-600" size={22} />
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recent Reports</h2>
        </div>
        <div className="p-6 space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="group flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
                  <FileText size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{r.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{r.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default" size="sm" className="font-black">{r.type}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-500 font-black text-[10px] uppercase tracking-widest"
                  onClick={() => handleDownload(r.title)}
                >
                  <Download size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
