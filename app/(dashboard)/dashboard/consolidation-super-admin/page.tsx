'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Fuel, 
  Download, 
  TrendingUp, 
  Activity, 
  Globe, 
  Filter, 
  ArrowUpRight, 
  Calendar,
  Layers,
  Search,
  Zap
} from 'lucide-react';
import { formatLiters, formatCurrency } from '@/utils/format';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { cn } from '@/utils/cn';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export default function ConsolidationSuperAdminPage() {
  const [selectedRegion, setSelectedRegion] = useState('All Regions');

  const consumptionData = [
    { name: 'Jan', petrol: 45000, diesel: 32000, subsidy: 12000 },
    { name: 'Feb', petrol: 52000, diesel: 38000, subsidy: 15000 },
    { name: 'Mar', petrol: 48000, diesel: 41000, subsidy: 13500 },
    { name: 'Apr', petrol: 61000, diesel: 45000, subsidy: 18000 },
    { name: 'May', petrol: 55000, diesel: 42000, subsidy: 16000 },
    { name: 'Jun', petrol: 67000, diesel: 49000, subsidy: 21000 },
  ];

  const regionPerformance = [
    { region: 'Banjul', value: 85, trend: '+12%', color: '#3b82f6' },
    { region: 'Kanifing', value: 72, trend: '+5%', color: '#8b5cf6' },
    { region: 'Brikama', value: 94, trend: '+18%', color: '#10b981' },
    { region: 'Mansakonko', value: 45, trend: '-2%', color: '#f59e0b' },
  ];

  const stats = [
    { label: 'National Daily Avg', value: '42,500 L', trend: '+8.2%', icon: Activity, color: 'blue' },
    { label: 'Active Fleet Count', value: '1,284', trend: '+45', icon: Globe, color: 'emerald' },
    { label: 'Subsidy Efficiency', value: '94.2%', trend: '+1.5%', icon: Zap, color: 'purple' },
    { label: 'Total Volume (MTD)', value: '1.2M Liters', trend: '+12.4%', icon: Layers, color: 'amber' },
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
          <div className="flex gap-4">
            <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px]">
              <Calendar size={16} className="mr-2 text-slate-400" />
              Custom Range
            </Button>
            <Button variant="primary" className="h-14 px-8 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]">
              <Download size={18} className="mr-2" strokeWidth={3} />
              Export Report
            </Button>
          </div>
        </div>

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
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-black">
                  <TrendingUp size={12} /> {stat.trend}
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
              <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                {['6 Months', '1 Year', 'Max'].map((range) => (
                  <button 
                    key={range}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      range === '6 Months' ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {range}
                  </button>
                ))}
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
                {regionPerformance.map((region, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{region.region}</p>
                        <p className="text-lg font-black">{region.value}% Utilization</p>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 text-xs font-black">
                        <ArrowUpRight size={14} /> {region.trend}
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 group-hover:opacity-80" 
                        style={{ width: `${region.value}%`, backgroundColor: region.color }} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="primary" className="w-full mt-12 bg-white text-slate-900 hover:bg-slate-100 border-none h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">
                Regional Drilldown
              </Button>
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
            <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-100 dark:border-slate-800 font-black text-[10px] uppercase tracking-widest">
              <Filter size={16} className="mr-2" /> Filter Data
            </Button>
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
                <Bar dataKey="petrol" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Commercial Consumption" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
