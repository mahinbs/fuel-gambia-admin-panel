'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Fuel, Download, Activity, Globe, Filter, TrendingUp, 
  Calendar, Layers, Zap, Loader2 
} from 'lucide-react';
import { formatLiters, formatCurrency } from '@/utils/format';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { cn } from '@/utils/cn';
import { supabase } from '@/supabase';
import { useToast } from '@/components/providers/ToastProvider';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';

export default function ConsolidationSuperAdminPage() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic stats
  const [nationalDailyAvg, setNationalDailyAvg] = useState(0);
  const [activeFleetCount, setActiveFleetCount] = useState(0);
  const [subsidyEfficiency, setSubsidyEfficiency] = useState(100);
  const [totalVolumeMtd, setTotalVolumeMtd] = useState(0);
  const [regionPerformance, setRegionPerformance] = useState<any[]>([]);
  const [consumptionData, setConsumptionData] = useState<any[]>([]);

  const fetchConsolidationData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch beneficiary fleet count
      const { count: bCount } = await supabase
        .from('profiles')
        .select('*', { head: true, count: 'exact' })
        .eq('role', 'BENEFICIARY');
      
      setActiveFleetCount(bCount || 0);

      // 2. Fetch all successful transactions for telemetry
      const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select('liters, mode, fuel_type, created_at, station:stations(location)')
        .eq('status', 'SUCCESS');

      if (txError) throw txError;

      const transactions = txs || [];

      // 3. Compute stats
      // Total Liters MTD (current month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const mtdLiters = transactions
        .filter(t => t.created_at.slice(0, 7) === currentMonth)
        .reduce((sum, t) => sum + Number(t.liters || 0), 0);
      setTotalVolumeMtd(mtdLiters);

      // Daily Average Volume
      // Find the unique dates in the transaction list
      const uniqueDays = new Set(transactions.map(t => t.created_at.split('T')[0]));
      const totalDaysCount = uniqueDays.size || 1;
      const totalLitersAllTime = transactions.reduce((sum, t) => sum + Number(t.liters || 0), 0);
      setNationalDailyAvg(totalLitersAllTime / totalDaysCount);

      // Subsidy Efficiency
      const subsidyLiters = transactions
        .filter(t => t.mode === 'SUBSIDY')
        .reduce((sum, t) => sum + Number(t.liters || 0), 0);
      const subsidyPercentage = totalLitersAllTime > 0 ? (subsidyLiters / totalLitersAllTime) * 100 : 100;
      setSubsidyEfficiency(subsidyPercentage);

      // 4. Compute Regional Performance
      const regionMap: Record<string, { total: number; subsidy: number }> = {};
      transactions.forEach(t => {
        const stationData = Array.isArray(t.station) ? t.station[0] : t.station;
        const region = (stationData as any)?.location || 'Other Region';
        if (!regionMap[region]) {
          regionMap[region] = { total: 0, subsidy: 0 };
        }
        regionMap[region].total += Number(t.liters || 0);
        if (t.mode === 'SUBSIDY') {
          regionMap[region].subsidy += Number(t.liters || 0);
        }
      });

      const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
      const calculatedRegions = Object.entries(regionMap).map(([region, val], idx) => {
        const utilization = val.total > 0 ? Math.round((val.subsidy / val.total) * 100) : 0;
        return {
          region,
          value: utilization || Math.min(100, Math.round(val.total / 1000)), // fallback indicator
          trend: '+5%',
          color: colors[idx % colors.length]
        };
      });
      setRegionPerformance(calculatedRegions);

      // 5. Build Monthly Consumption Chart data (last 6 months)
      const monthsMap: Record<string, { name: string; petrol: number; diesel: number; subsidy: number }> = {};
      
      // Initialize past 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toISOString().slice(0, 7); // YYYY-MM
        const name = d.toLocaleString('default', { month: 'short' });
        monthsMap[key] = { name, petrol: 0, diesel: 0, subsidy: 0 };
      }

      transactions.forEach(t => {
        const key = t.created_at.slice(0, 7);
        if (monthsMap[key]) {
          const liters = Number(t.liters || 0);
          if (t.fuel_type === 'PETROL') {
            monthsMap[key].petrol += liters;
          } else if (t.fuel_type === 'DIESEL') {
            monthsMap[key].diesel += liters;
          }
          if (t.mode === 'SUBSIDY') {
            monthsMap[key].subsidy += liters;
          }
        }
      });

      setConsumptionData(Object.values(monthsMap));

    } catch (err: any) {
      showToast(err.message || 'Failed to sync consolidation metrics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsolidationData();
  }, []);

  const stats = [
    { label: 'National Daily Avg', value: `${formatLiters(nationalDailyAvg)}`, trend: '+8.2%', icon: Activity, color: 'blue' },
    { label: 'Active Fleet Count', value: `${activeFleetCount}`, trend: `+${activeFleetCount}`, icon: Globe, color: 'emerald' },
    { label: 'Subsidy Efficiency', value: `${subsidyEfficiency.toFixed(1)}%`, trend: '+1.5%', icon: Zap, color: 'purple' },
    { label: 'Total Volume (MTD)', value: `${formatLiters(totalVolumeMtd)}`, trend: '+12.4%', icon: Layers, color: 'amber' },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">National Consumption Ledger</h1>
            <p className="text-slate-500 font-medium mt-2 uppercase tracking-widest text-[10px] font-black">Live Telemetry • All Administrative Regions</p>
          </div>
        </div>

        {isLoading && consumptionData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] shadow-2xl">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Aggregating consumption telemetry...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, idx) => (
                <Card key={idx} className="p-8 border-none shadow-2xl hover:shadow-3xl transition-all group overflow-hidden relative">
                  <div className="flex items-start justify-between relative z-10">
                    <div className={cn(
                      "p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3",
                      stat.color === 'blue' ? "bg-blue-600 text-white shadow-blue-500/20" :
                      stat.color === 'emerald' ? "bg-emerald-600 text-white shadow-emerald-500/20" :
                      stat.color === 'purple' ? "bg-purple-600 text-white shadow-purple-500/20" :
                      "bg-amber-600 text-white shadow-amber-500/20"
                    )}>
                      <stat.icon size={24} strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="mt-8 relative z-10">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                  </div>
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform" />
                </Card>
              ))}
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-10 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                      <Activity className="text-white" size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Consumption Flow (MTD)</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time national volume analysis</p>
                    </div>
                  </div>
                </div>
                
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={consumptionData}>
                      <defs>
                        <linearGradient id="colorPetrol" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorDiesel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontWeight: 900 }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                      <Area type="monotone" dataKey="petrol" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorPetrol)" name="Petrol Volume" />
                      <Area type="monotone" dataKey="diesel" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorDiesel)" name="Diesel Volume" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-10 border-none shadow-2xl bg-slate-900 text-white rounded-[2.5rem] relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tight mb-8">Regional Efficiency</h3>
                  <div className="space-y-10">
                    {regionPerformance.length === 0 ? (
                      <p className="text-xs text-slate-400">No regional data recorded.</p>
                    ) : (
                      regionPerformance.map((region, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{region.region}</p>
                              <p className="text-lg font-black">{region.value}% Utilization</p>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000 group-hover:opacity-80" 
                              style={{ width: `${region.value}%`, backgroundColor: region.color }} 
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
              </Card>
            </div>

            {/* Breakdown Card */}
            <Card className="p-10 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem]">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Institutional Distribution</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation breakdown by partner sector</p>
                </div>
              </div>
              
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={consumptionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                    <Tooltip 
                       cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                       contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                    />
                    <Bar dataKey="subsidy" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Government Subsidy" />
                    <Bar dataKey="petrol" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Commercial Consumption (Petrol)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
