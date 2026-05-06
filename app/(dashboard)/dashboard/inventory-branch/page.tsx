'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Package, Shield, AlertTriangle, Droplets, ArrowUpRight, History, Settings } from 'lucide-react';
import { formatLiters } from '@/utils/format';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';

export default function InventoryBranchPage() {
  const tanks = [
    { id: 'A', type: 'Petrol (PMS)', current: 12500, total: 20000, status: 'STABLE', lastFill: '2 days ago' },
    { id: 'B', type: 'Diesel (AGO)', current: 4200, total: 20000, status: 'LOW', lastFill: '5 days ago' },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_BRANCH}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Tank Telemetry</h1>
            <p className="text-slate-500 font-medium mt-2">Precision monitoring of subsurface fuel reserves and replenishment cycles</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="bg-white dark:bg-slate-900 h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-50">
              <History size={18} className="mr-2" strokeWidth={2.5} />
              Refill Log
            </Button>
            <Button variant="primary" className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 rounded-2xl px-10 font-black uppercase tracking-widest text-[10px]">
              Order Stock
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {tanks.map((tank) => {
            const fillPercent = (tank.current / tank.total) * 100;
            const isLow = fillPercent < 25;
            
            return (
              <Card key={tank.id} className="p-10 border-none shadow-2xl hover:shadow-3xl transition-all duration-500 group relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem]">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{tank.type}</h3>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Active Sensor: Site-B0{tank.id}</p>
                      </div>
                    </div>
                    <Badge variant={isLow ? 'error' : 'success'} className="font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm">
                      {tank.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-end mb-8">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Calculated Volume</p>
                      <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{formatLiters(tank.current)}</p>
                    </div>
                    <div className="text-right space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Efficiency</p>
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black text-lg">
                         <ArrowUpRight size={20} strokeWidth={3} /> 94%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">Tank Total Capacity</span>
                      <span className="text-slate-900 dark:text-white">{formatLiters(tank.total)}</span>
                    </div>
                    
                    <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden p-1.5 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                      <div 
                        className={cn(
                          "h-full rounded-xl transition-all duration-1000 relative group-hover:brightness-110",
                          isLow 
                            ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.3)]" 
                            : "bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                        )} 
                        style={{ width: `${fillPercent}%` }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilization Index</span>
                      <div className="flex items-baseline gap-1">
                        <span className={cn(
                          "text-2xl font-black tracking-tighter",
                          isLow ? "text-rose-600" : "text-blue-600 dark:text-blue-400"
                        )}>{fillPercent.toFixed(1)}%</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800/50 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500 border border-slate-100 dark:border-slate-700 shadow-sm">
                          <History size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Stock Cycle</p>
                          <p className="text-xs font-black text-slate-700 dark:text-slate-300">Last Fill: {tank.lastFill}</p>
                        </div>
                     </div>
                     <button className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all border border-slate-100 dark:border-slate-700 active:scale-95 group/settings">
                        <Settings size={22} className="text-slate-400 group-hover:rotate-90 transition-transform duration-500" strokeWidth={2.5} />
                     </button>
                  </div>
                </div>

                <Droplets className="absolute -bottom-16 -right-16 w-64 h-64 text-slate-100 dark:text-slate-800/20 -rotate-12 pointer-events-none group-hover:scale-110 group-hover:translate-x-4 transition-transform duration-1000" />
              </Card>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
