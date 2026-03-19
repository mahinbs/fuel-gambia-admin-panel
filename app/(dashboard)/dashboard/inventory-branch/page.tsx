'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Package, Shield, AlertTriangle, Droplets, ArrowUpRight, History, Settings } from 'lucide-react';
import { formatLiters } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function InventoryBranchPage() {
  const tanks = [
    { id: 'A', type: 'Petrol (PMS)', current: 12500, total: 20000, status: 'STABLE', lastFill: '2 days ago' },
    { id: 'B', type: 'Diesel (AGO)', current: 4200, total: 20000, status: 'LOW', lastFill: '5 days ago' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Live Inventory</h1>
          <p className="text-slate-500 font-medium mt-2">Real-time monitoring of fuel levels and tank health</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="bg-white dark:bg-slate-900 border-2 font-black text-xs uppercase tracking-widest px-6 h-12 rounded-2xl">
            <History size={18} className="mr-2" />
            Audit Logs
          </Button>
          <Button variant="primary" className="shadow-blue-500/20 hover:shadow-xl transition-all h-12 rounded-2xl px-8 font-black">
            Request Refill
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tanks.map((tank) => {
          const fillPercent = (tank.current / tank.total) * 100;
          const isLow = fillPercent < 25;
          
          return (
            <Card key={tank.id} className="p-8 border-none shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{tank.type}</h3>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Tank Identifier: Site-B0{tank.id}</p>
                  </div>
                  <Badge variant={isLow ? 'error' : 'success'} size="sm" className="font-black">
                    {tank.status}
                  </Badge>
                </div>

                <div className="flex justify-between items-end mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Volume</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">{formatLiters(tank.current)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                    <div className="flex items-center gap-1 text-emerald-500 font-bold">
                       <ArrowUpRight size={14} /> 94%
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Tank Capacity</span>
                    <span className="text-slate-900 dark:text-white">{formatLiters(tank.total)}</span>
                  </div>
                  
                  <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 border border-slate-200/50 dark:border-slate-700/50">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 relative",
                        isLow 
                          ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]" 
                          : "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      )} 
                      style={{ width: `${fillPercent}%` }}
                    >
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilization</span>
                    <span className={cn(
                      "text-sm font-black",
                      isLow ? "text-rose-500" : "text-slate-900 dark:text-white"
                    )}>{fillPercent.toFixed(1)}%</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Droplets size={12} className="text-blue-500" />
                      Last Fill: {tank.lastFill}
                   </div>
                   <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <Settings size={18} className="text-slate-400" />
                   </button>
                </div>
              </div>

              {/* Decorative Watermark */}
              <Droplets className="absolute -bottom-10 -right-10 w-48 h-48 text-slate-100 dark:text-slate-800/20 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
