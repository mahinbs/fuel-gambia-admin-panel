'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ClipboardList, Plus, Building, TrendingUp, AlertCircle, ChevronRight, Search, Droplets } from 'lucide-react';
import { formatLiters } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function AllocationsGovPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const allocations = [
    { id: '1', department: 'Ministry of Health', monthly: 10000, used: 6500, status: 'STABLE' },
    { id: '2', department: 'Ministry of Education', monthly: 8000, used: 4200, status: 'STABLE' },
    { id: '3', department: 'Police Headquarters', monthly: 15000, used: 13200, status: 'CRITICAL' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Fuel Allocations</h1>
          <p className="text-slate-500 font-medium mt-2">Monitor and manage departmental fuel quotas</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" strokeWidth={3} />
          New Allocation
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search departments..." 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
          />
        </div>
        <div className="flex gap-2">
           <Badge variant="success" className="h-10 px-4">Stable: 8</Badge>
           <Badge variant="warning" className="h-10 px-4">Critical: 2</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allocations.map((a) => {
          const usagePercent = (a.used / a.monthly) * 100;
          const isCritical = usagePercent > 85;
          
          return (
            <Card key={a.id} className="p-8 border-none shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:scale-110 transition-transform">
                  <Building size={24} className="text-slate-400" />
                </div>
                <Badge variant={isCritical ? 'error' : 'success'} size="sm" className="font-black">
                  {isCritical ? 'Critical' : 'Stable'}
                </Badge>
              </div>

              <div className="space-y-1 mb-8 relative z-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{a.department}</h3>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Departmental ID: #00{a.id}</p>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Used</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{formatLiters(a.used)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quota</p>
                    <p className="text-sm font-bold text-slate-500">{formatLiters(a.monthly)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className={isCritical ? "text-rose-500" : "text-blue-500"}>Usage Intensity</span>
                    <span className="text-slate-400">{usagePercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        isCritical ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]" : "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                      )} 
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 relative z-10">
                <Button variant="ghost" className="w-full text-blue-500 font-bold hover:bg-blue-50 dark:hover:bg-blue-500/5 group text-xs uppercase tracking-widest">
                  View Utilization Report <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Decorative background element */}
              <div className={cn(
                "absolute -bottom-8 -right-8 w-32 h-32 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform group-hover:scale-150 group-hover:-rotate-12",
                isCritical ? "text-rose-500" : "text-blue-500"
              )}>
                <TrendingUp size={128} />
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Fuel Allocation"
        size="lg"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Department</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all">
                <option value="">Select Department</option>
                <option value="health">Ministry of Health</option>
                <option value="education">Ministry of Education</option>
                <option value="police">Police Headquarters</option>
                <option value="agriculture">Ministry of Agriculture</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Fuel Type</label>
              <div className="flex gap-4">
                 <button className="flex-1 p-4 border-2 border-blue-600 rounded-2xl flex flex-col items-center gap-2 bg-blue-50 dark:bg-blue-900/20">
                    <Droplets className="text-blue-600" size={24} />
                    <span className="text-xs font-black uppercase text-blue-600">Petrol</span>
                 </button>
                 <button className="flex-1 p-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center gap-2 hover:border-blue-500 transition-colors">
                    <Droplets className="text-slate-400" size={24} />
                    <span className="text-xs font-black uppercase text-slate-400">Diesel</span>
                 </button>
              </div>
            </div>
            <Input label="Monthly Limit (Liters)" type="number" placeholder="e.g. 5000" />
            <Input label="Allocation Expiry" type="date" />
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
             <div className="flex gap-3">
                <AlertCircle className="text-blue-500 shrink-0" size={18} />
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  Allocations are automatically renewed on the 1st of every month unless otherwise specified in system policies.
                </p>
             </div>
          </div>
          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" onClick={() => setIsModalOpen(false)}>
              Initialize Allocation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
