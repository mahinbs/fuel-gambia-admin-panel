'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, Download, TrendingUp, Calendar, Search, Filter, FileBarChart, CalendarRange } from 'lucide-react';
import { cn } from '@/utils/cn';

type IntervalType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export default function ReportsGovPage() {
  const [selectedInterval, setSelectedInterval] = useState<IntervalType>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDownload = (title: string) => {
    const period = selectedInterval === 'custom' ? `${startDate || 'N/A'} to ${endDate || 'N/A'}` : selectedInterval;
    alert(`Downloading "${title}" for ${period} period...`);
  };

  const intervals: { label: string; key: IntervalType }[] = [
    { label: 'Today', key: 'day' },
    { label: 'Weekly', key: 'week' },
    { label: 'Monthly', key: 'month' },
    { label: 'Quarterly', key: 'quarter' },
    { label: 'Annual', key: 'year' },
    { label: 'Custom', key: 'custom' },
  ];

  const reports = [
    { id: '1', title: 'March 2026 Allocation Report', description: 'Monthly summary of all departmental fuel disbursements', date: 'Mar 16, 2026', size: '2.4 MB', type: 'PDF' },
    { id: '2', title: 'Quarterly Consumption Audit', description: 'Detailed audit of fuel utilization across all government branches', date: 'Mar 12, 2026', size: '5.1 MB', type: 'XLSX' },
    { id: '3', title: 'Beneficiary Verification Log', description: 'History of all new beneficiary approvals and document checks', date: 'Mar 08, 2026', size: '1.2 MB', type: 'PDF' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Government Analytics</h1>
          <p className="text-slate-500 font-medium mt-2">Comprehensive reporting on national fuel distribution and quotas</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900 shadow-sm font-black text-xs uppercase tracking-widest">
            Schedule Report
          </Button>
          <Button variant="primary" size="lg" className="shadow-blue-500/20 hover:shadow-xl transition-all" onClick={() => handleDownload('Custom Government Report')}>
            <TrendingUp size={20} className="mr-2" />
            Generate Custom
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <Card className="p-6 border-none shadow-xl bg-blue-600 text-white overflow-hidden relative group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Allocated</p>
                 <h3 className="text-3xl font-black">2.4M L</h3>
                 <p className="text-xs font-bold mt-4 flex items-center gap-1">
                    <TrendingUp size={14} /> +12.5% from Feb
                 </p>
              </div>
              <FileBarChart className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 -rotate-12 group-hover:scale-110 transition-transform" />
           </Card>
           
           <Card className="p-6 border-none shadow-xl bg-slate-900 text-white overflow-hidden relative group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Active Beneficiaries</p>
                 <h3 className="text-3xl font-black">1,248</h3>
                 <p className="text-xs font-bold mt-4 text-emerald-400 flex items-center gap-1">
                    98.4% Verified
                 </p>
              </div>
              <div className="absolute top-1/2 -right-4 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl" />
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {/* Date Interval Selector */}
          <Card className="p-6 border-none shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <CalendarRange className="text-blue-600" size={20} />
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Download by Period</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {intervals.map((iv) => (
                <button
                  key={iv.key}
                  onClick={() => setSelectedInterval(iv.key)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all',
                    selectedInterval === iv.key
                      ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-300'
                  )}
                >
                  {iv.label}
                </button>
              ))}
            </div>
            {selectedInterval === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">From</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {['Allocation Report', 'Consumption Audit', 'Beneficiary Log', 'Policy Summary'].map((r) => (
                <Button key={r} variant="outline" className="font-black gap-2 border-2 text-xs" onClick={() => handleDownload(r)}>
                  <Download size={14} /> {r}
                </Button>
              ))}
            </div>
          </Card>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileText className="text-blue-500" size={24} />
              Recent System Reports
            </h2>
            <div className="flex gap-2">
              <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
                <Search size={18} className="text-slate-400" />
              </button>
              <button className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
                <Filter size={18} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="p-6 border-none shadow-xl hover:shadow-2xl transition-all group flex items-center gap-6">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <FileText size={28} strokeWidth={2.5} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-black text-slate-900 dark:text-white truncate group-hover:text-blue-500 transition-colors">{report.title}</h3>
                    <Badge variant="info" size="sm" className="font-black">{report.type}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 font-medium truncate mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {report.date}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{report.size}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" onClick={() => handleDownload(report.title)}>
                    <Download size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
          
          <Button variant="ghost" className="w-full h-14 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-black tracking-widest text-xs uppercase hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl">
            View Archive
          </Button>
        </div>
      </div>
    </div>
  );
}
