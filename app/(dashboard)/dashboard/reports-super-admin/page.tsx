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
  Users
} from 'lucide-react';
import { cn } from '@/utils/cn';

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
      title: 'System Access & Security Audit', 
      description: 'Audit logs of administrative actions and platform health metrics.',
      icon: Shield,
      color: 'amber'
    },
    {
      id: 'bespoke-query',
      title: 'Bespoke Analytics Engine',
      description: 'Run custom queries against the national database to generate highly specific reports.',
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
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">National Intelligence</h1>
          <p className="text-slate-500 font-medium mt-2">Comprehensive platform-wide reporting and data exports</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
          {intervals.map((interval) => (
            <button
              key={interval}
              onClick={() => {
                setSelectedInterval(interval);
                if (interval === 'Custom') setShowDatePicker(true);
                else setShowDatePicker(false);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                selectedInterval === interval 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              {interval}
            </button>
          ))}
        </div>
      </div>

      {showDatePicker && (
        <Card className="p-6 border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="date" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="date" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10" />
              </div>
            </div>
            <Button variant="primary" className="h-[46px] px-8 rounded-xl font-black uppercase tracking-widest text-xs">Apply Range</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="p-8 border-none shadow-2xl hover:shadow-blue-500/5 transition-all group overflow-hidden relative">
              <div className="flex items-start justify-between relative z-10">
                <div className={cn(
                  "p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
                  report.color === 'blue' ? "bg-blue-600 text-white shadow-blue-500/20" :
                  report.color === 'emerald' ? "bg-emerald-600 text-white shadow-emerald-500/20" :
                  report.color === 'purple' ? "bg-purple-600 text-white shadow-purple-500/20" :
                  "bg-amber-600 text-white shadow-amber-500/20"
                )}>
                  <Icon size={28} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant="default" className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-none font-black text-[10px]">VERIFIED OCT 2025</Badge>
                </div>
              </div>

              <div className="mt-8 relative z-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{report.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm">
                  {report.description}
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-3 relative z-10">
                <Button variant="primary" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-5 h-11 shadow-lg shadow-blue-500/20 group">
                  <Download size={14} className="mr-2 group-hover:-translate-y-0.5 transition-transform" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest px-5 h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  <Download size={14} className="mr-2" />
                  Export XLSX
                </Button>
              </div>

              <div className={cn(
                "absolute -right-8 -bottom-8 w-40 h-40 rounded-full blur-3xl opacity-5 pointer-events-none transition-opacity group-hover:opacity-10",
                report.color === 'blue' ? "bg-blue-600" :
                report.color === 'emerald' ? "bg-emerald-600" :
                report.color === 'purple' ? "bg-purple-600" :
                "bg-amber-600"
              )} />
            </Card>
          );
        })}
      </div>

      <Card className="p-8 border-none shadow-2xl bg-slate-900 dark:bg-slate-950 text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-black tracking-tight flex items-center justify-center md:justify-start gap-3">
              <TrendingUp className="text-blue-400" />
              Real-time System Monitoring
            </h2>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Live National Consumption Feed • Active</p>
          </div>
          <Button variant="primary" className="bg-blue-600 border-none hover:bg-blue-500 px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/30">
            Launch Operations Console
          </Button>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      </Card>

      <div className="space-y-6 pt-10">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bespoke Query Builder</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bespokeReports.map((report, idx) => (
            <Card key={idx} className="p-6 border-none shadow-lg bg-white dark:bg-slate-900 hover:ring-2 hover:ring-blue-500/20 transition-all cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors mb-4">
                <Filter size={20} />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">{report.title}</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{report.description}</p>
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-600">
                Run Query
                <ChevronDown size={12} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Placeholder components to fix missing imports if needed
const Shield = ({ ...props }: any) => <FileText {...props} />;
