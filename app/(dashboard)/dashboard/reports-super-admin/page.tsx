'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Search,
  ChevronDown,
  Globe,
  Building2,
  Users,
  Shield,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

type Interval = 'Today' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Custom';

export default function ReportsSuperAdminPage() {
  const [selectedInterval, setSelectedInterval] = useState<Interval>('Monthly');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const reportTypes = [
    { 
      id: 'national-subsidy', 
      title: 'National Subsidy Audit', 
      description: 'Consolidated report of all government fuel subsidies disbursed nationwide.',
      icon: Globe,
      color: 'blue'
    },
    { 
      id: 'station-performance', 
      title: 'Regional Station Performance', 
      description: 'Comparative analytics of fuel stations by volume, revenue, and compliance.',
      icon: BarChart3,
      color: 'emerald'
    },
    { 
      id: 'institutional-billing', 
      title: 'Institutional Settlement Ledger', 
      description: 'Billing summaries and payment status for all corporate and govt partners.',
      icon: Building2,
      color: 'purple'
    },
    { 
      id: 'user-activity', 
      title: 'Security Audit Feed', 
      description: 'Comprehensive audit logs of administrative actions and platform health.',
      icon: Shield,
      color: 'amber'
    },
    {
      id: 'bespoke-query',
      title: 'Bespoke Analytics Engine',
      description: 'Run custom SQL-grade queries against the national database for specific insights.',
      icon: Search,
      color: 'blue'
    }
  ];

  const bespokeReports = [
    { title: 'Users by Institution Branch', description: 'Detailed breakdown of staff mapped to specific geographical branches.' },
    { title: 'Users by Fuel Company', description: 'Onboarded employees filtered by their respective fuel provider.' },
    { title: 'Sales Report per Company', description: 'Consolidated revenue and volume per corporate entity.' },
    { title: 'Staff Enrollment Audit', description: 'Track onboarding dates for all staff across all levels.' },
  ];

  const intervals: Interval[] = ['Today', 'Weekly', 'Monthly', 'Quarterly', 'Annual', 'Custom'];

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence Center</h1>
            <p className="text-slate-500 font-medium mt-2">National platform-wide reporting and data-driven insights</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {intervals.map((interval) => (
              <button
                key={interval}
                onClick={() => {
                  setSelectedInterval(interval);
                  if (interval === 'Custom') setShowDatePicker(true);
                  else setShowDatePicker(false);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedInterval === interval 
                    ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                )}
              >
                {interval}
              </button>
            ))}
          </div>
        </div>

        {showDatePicker && (
          <Card className="p-8 border-none shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Archive Start</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="date" className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Archive End</label>
                <div className="relative">
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="date" className="w-full h-14 pl-14 pr-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
              </div>
              <Button variant="primary" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20">Fetch Analytics</Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="p-10 border-none shadow-2xl hover:shadow-3xl transition-all group overflow-hidden relative">
                <div className="flex items-start justify-between relative z-10">
                  <div className={cn(
                    "p-5 rounded-[1.5rem] shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                    report.color === 'blue' ? "bg-blue-600 text-white shadow-blue-500/20" :
                    report.color === 'emerald' ? "bg-emerald-600 text-white shadow-emerald-500/20" :
                    report.color === 'purple' ? "bg-purple-600 text-white shadow-purple-500/20" :
                    "bg-amber-600 text-white shadow-amber-500/20"
                  )}>
                    <Icon size={32} strokeWidth={2.5} />
                  </div>
                  <Badge variant="info" className="font-black text-[9px] px-2 py-1 tracking-widest shadow-sm">VERIFIED LIVE</Badge>
                </div>

                <div className="mt-10 relative z-10">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">{report.title}</h3>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed max-w-sm uppercase tracking-tight">
                    {report.description}
                  </p>
                </div>

                <div className="mt-12 flex flex-wrap gap-4 relative z-10">
                  <Button variant="primary" size="lg" className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 h-14 shadow-xl shadow-blue-500/20 group">
                    <Download size={16} className="mr-2 group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 h-14 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                    <Download size={16} className="mr-2" strokeWidth={3} />
                    Export XLSX
                  </Button>
                </div>

                <div className={cn(
                  "absolute -right-12 -bottom-12 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none transition-all duration-700 group-hover:scale-150 group-hover:opacity-20",
                  report.color === 'blue' ? "bg-blue-600" :
                  report.color === 'emerald' ? "bg-emerald-600" :
                  report.color === 'purple' ? "bg-purple-600" :
                  "bg-amber-600"
                )} />
              </Card>
            );
          })}
        </div>

        <Card className="p-10 border-none shadow-2xl bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tight flex items-center justify-center md:justify-start gap-4">
                <TrendingUp className="text-blue-400" size={32} />
                Strategic Operations Center
              </h2>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.25em]">Live National Consumption Feed • Operational Status: Nominal</p>
            </div>
            <Button variant="primary" className="bg-blue-600 border-none hover:bg-blue-500 px-12 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95">
              Launch Intelligence Console
              <ArrowRight size={18} className="ml-3" strokeWidth={3} />
            </Button>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/5 pointer-events-none" />
        </Card>

        <div className="space-y-8 pt-10">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Bespoke Query Builder</h2>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bespokeReports.map((report, idx) => (
              <Card key={idx} className="p-8 border-none shadow-xl bg-white dark:bg-slate-900 hover:shadow-2xl hover:shadow-blue-500/5 transition-all cursor-pointer group rounded-[2rem]">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all mb-6">
                  <Filter size={24} strokeWidth={2.5} />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white mb-3 tracking-tight">{report.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tight">{report.description}</p>
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-600">
                  Initialize
                  <ArrowRight size={14} strokeWidth={3} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

