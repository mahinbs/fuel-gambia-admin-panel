'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FileText, Download, TrendingUp, BarChart3, PieChart, Calendar, Search, Filter, CalendarRange, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/format';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { dashboardService } from '@/services/dashboardService';
import { transactionFunctions, stationFunctions } from '@/supabase';

type IntervalType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export default function ReportsHQPage() {
  const [selectedInterval, setSelectedInterval] = useState<IntervalType>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [stationsCount, setStationsCount] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  async function loadData() {
    try {
      setLoading(true);
      const [hqData, stationsData, transactionsData] = await Promise.all([
        dashboardService.getHQDashboard(),
        stationFunctions.getStations(),
        transactionFunctions.getTransactions()
      ]);
      setStats(hqData.stats);
      setStationsCount(stationsData.total || 0);
      setTransactions(transactionsData.data || []);
    } catch (err) {
      console.error('Failed to load HQ reports data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const reports = [
    { id: '1', title: 'Profit & Loss Summary', description: 'Consolidated financial performance across all fuel stations', date: 'Mar 15, 2026', format: 'PDF', status: 'READY' },
    { id: '2', title: 'Inventory Turnover Report', description: 'Detailed analysis of fuel stock movement and replenishment cycles', date: 'Mar 14, 2026', format: 'XLSX', status: 'READY' },
    { id: '3', title: 'Station Efficiency Audit', description: 'Performance metrics for pump attendants and branch managers', date: 'Mar 10, 2026', format: 'PDF', status: 'ARCHIVED' },
  ];

  const intervals: { label: string; key: IntervalType }[] = [
    { label: 'Today', key: 'day' },
    { label: 'Weekly', key: 'week' },
    { label: 'Monthly', key: 'month' },
    { label: 'Quarterly', key: 'quarter' },
    { label: 'Annual', key: 'year' },
    { label: 'Custom', key: 'custom' },
  ];

  const handleDownload = (title: string) => {
    alert(`Downloading "${title}" for ${selectedInterval === 'custom' ? `${startDate} to ${endDate}` : selectedInterval} period...`);
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_HQ}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Corporate Intelligence</h1>
            <p className="text-slate-500 font-medium mt-2">Strategic financial and operational analytics for Station HQ</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="gap-2"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw size={18} className={cn(loading && 'animate-spin')} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="shadow-blue-500/20 hover:shadow-xl transition-all"
              onClick={() => handleDownload('Full HQ Report')}
            >
              <Download size={20} className="mr-2" strokeWidth={3} />
              Export All Data
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { label: 'Today\'s Revenue', value: stats?.todaySales ? formatCurrency(stats.todaySales) : 'D 0', change: 'Live', icon: BarChart3, color: 'blue' },
              { label: 'Total Network Stock', value: stats ? `${(stats.petrolStock + stats.dieselStock).toLocaleString()} L` : '0 L', change: `${stats ? stats.lowStockAlerts : 0} low stock stations`, icon: TrendingUp, color: 'emerald' },
              { label: 'Active Sites', value: `${stationsCount} Stations`, change: 'Operational', icon: PieChart, color: 'amber' },
            ].map((stat) => (
              <Card key={stat.label} className="p-8 border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative bg-white dark:bg-slate-900">
                <div className="relative z-10">
                  <div className={cn(
                    'p-3 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110',
                    stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' :
                    stat.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                    'bg-amber-50 dark:bg-amber-500/10 text-amber-500'
                  )}>
                    <stat.icon size={28} strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant={stat.color === 'emerald' && stats?.lowStockAlerts > 0 ? 'warning' : 'success'} size="sm" className="font-black">{stat.change}</Badge>
                  </div>
                </div>
                <div className={cn(
                  'absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.04] pointer-events-none group-hover:scale-150 transition-transform',
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'emerald' ? 'text-emerald-500' :
                  'text-amber-500'
                )}>
                  <stat.icon size={128} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Interval Selector Card */}
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
            {['Profit & Loss', 'Inventory Summary', 'Staff Performance', 'Fuel Consumption'].map((r) => (
              <Button
                key={r}
                variant="outline"
                className="font-black gap-2 border-2"
                onClick={() => handleDownload(r)}
              >
                <Download size={14} />
                {r}
              </Button>
            ))}
          </div>
        </Card>

        {/* Live Recent Transactions log */}
        <Card className="p-8 border-none shadow-2xl space-y-8 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="text-blue-500" size={24} />
              Recent Network Transactions
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  {['Reference', 'User', 'Station', 'Liters', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm font-bold text-slate-400">Loading transactions...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm font-bold text-slate-400">No recent transactions found</td>
                  </tr>
                ) : (
                  transactions.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 text-sm font-black text-slate-900 dark:text-white">{tx.reference_number || tx.id?.slice(0, 8)}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-600 dark:text-slate-300">{tx.user?.name || 'Customer'}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-600 dark:text-slate-300">{tx.station?.name || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm font-black text-slate-900 dark:text-white">{tx.liters} L</td>
                      <td className="py-4 px-6 text-sm font-black text-blue-600 dark:text-blue-400">{formatCurrency(tx.amount)}</td>
                      <td className="py-4 px-6">
                        <Badge variant={tx.status === 'SUCCESS' ? 'success' : 'error'} size="sm" className="font-black">
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 font-bold">{new Date(tx.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-2xl space-y-8 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <FileText className="text-slate-400" size={24} />
              Reports Library
            </h2>
            <div className="flex gap-2">
              <div className="relative mr-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search reports..." className="pl-10 pr-4 py-2 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 bg-white dark:bg-slate-900 transition-all" />
              </div>
              <button className="p-2 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Filter size={18} className="text-slate-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            {reports.map((report) => (
              <div key={report.id} className="group p-6 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-slate-400 group-hover:text-blue-500 transition-colors">
                      <FileText size={24} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 dark:text-white leading-tight group-hover:text-blue-500 transition-colors">{report.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{report.description}</p>
                    </div>
                  </div>
                  <Badge variant={report.status === 'READY' ? 'success' : 'default'} size="sm" className="font-black shrink-0">{report.format}</Badge>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar size={12} />
                    {report.date}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-500 font-black text-[10px] uppercase tracking-widest group-hover:bg-blue-50 dark:hover:bg-blue-500/10"
                    onClick={() => handleDownload(report.title)}
                  >
                    Download <Download size={14} className="ml-1.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
