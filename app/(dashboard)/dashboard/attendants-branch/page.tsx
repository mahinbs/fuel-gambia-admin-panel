'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { UserCog, Activity, Coffee, Droplets, TrendingUp, Search, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { DataTable } from '@/components/ui/DataTable';

export default function AttendantsBranchPage() {
  const attendants = [
    { id: '1', name: 'Musa Faal', pump: 'Pump A', status: 'ON_DUTY', dispensed: '1,240 L', transactions: 34, shift: 'Morning' },
    { id: '2', name: 'Binta Drammeh', pump: 'Pump B', status: 'ON_BREAK', dispensed: '860 L', transactions: 21, shift: 'Morning' },
    { id: '3', name: 'Ousman Bah', pump: 'Pump C', status: 'ON_DUTY', dispensed: '1,050 L', transactions: 28, shift: 'Morning' },
    { id: '4', name: 'Fatima Jallow', pump: 'Pump A', status: 'UPCOMING', dispensed: '—', transactions: 0, shift: 'Evening' },
  ];

  const statusConfig: Record<string, { label: string; variant: any; dot: string }> = {
    ON_DUTY: { label: 'On Duty', variant: 'success', dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
    ON_BREAK: { label: 'On Break', variant: 'warning', dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' },
    UPCOMING: { label: 'Upcoming', variant: 'info', dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' },
  };

  const columns = [
    {
      key: 'name',
      label: 'Attendant',
      render: (val: string, item: any) => (
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/20">
              {val.charAt(0)}
            </div>
            <div className={cn('absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 z-10', statusConfig[item.status]?.dot)} />
          </div>
          <div className="flex flex-col">
            <p className="font-black text-slate-900 dark:text-white tracking-tight">{val}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: AT-0{item.id}X2</p>
          </div>
        </div>
      ),
    },
    {
      key: 'pump',
      label: 'Assigned Pump',
      render: (val: string) => (
        <Badge variant="info" className="font-black text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg">
          {val}
        </Badge>
      ),
    },
    {
      key: 'shift',
      label: 'Shift',
      render: (val: string) => (
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
           <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{val}</span>
        </div>
      ),
    },
    {
      key: 'dispensed',
      label: 'Fuel Dispensed',
      render: (val: string) => <span className="font-black text-blue-600 dark:text-blue-400 tracking-tighter text-base">{val}</span>,
    },
    {
      key: 'transactions',
      label: 'Volume (MTD)',
      render: (val: number) => (
        <div className="flex items-baseline gap-1">
          <span className="font-black text-slate-900 dark:text-white text-base">{val > 0 ? val : '—'}</span>
          {val > 0 && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">txns</span>}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Duty Status',
      render: (val: string) => (
        <Badge variant={statusConfig[val]?.variant || 'default'} className="font-black text-[9px] uppercase tracking-widest px-3 py-1.5">
          {statusConfig[val]?.label || val}
        </Badge>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_BRANCH}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Staff Deployment</h1>
            <p className="text-slate-500 font-medium mt-2">Real-time terminal assignment and productivity metrics for frontline attendants</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-50" onClick={() => alert('Refreshing attendant status...')}>
              <RefreshCw size={18} className="mr-2" strokeWidth={2.5} />
              Sync Terminals
            </Button>
            <Button variant="primary" className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 rounded-2xl px-10 font-black uppercase tracking-widest text-[10px]">
              Assign Shift
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { label: 'Live Deployment', value: attendants.filter(a => a.status === 'ON_DUTY').length, icon: Activity, color: 'emerald', detail: 'Attendants Active' },
            { label: 'Relief Queue', value: attendants.filter(a => a.status === 'ON_BREAK').length, icon: Coffee, color: 'amber', detail: 'Staff on Break' },
            { label: 'Station Output', value: '3,150 L', icon: Droplets, color: 'blue', detail: 'Current Shift Total' },
          ].map((s) => (
            <Card key={s.label} className="p-10 border-none shadow-2xl relative overflow-hidden group bg-white dark:bg-slate-900 transition-all hover:translate-y-[-4px]">
              <div className={cn(
                'w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl mb-6',
                s.color === 'emerald' ? 'bg-emerald-600 text-white shadow-emerald-500/20' :
                s.color === 'amber' ? 'bg-amber-600 text-white shadow-amber-500/20' :
                'bg-blue-600 text-white shadow-blue-500/20'
              )}>
                <s.icon size={32} strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{s.label}</p>
              <div className="flex items-baseline gap-3">
                <p className={cn('text-5xl font-black tracking-tighter mt-1',
                  s.color === 'emerald' ? 'text-emerald-600' : s.color === 'amber' ? 'text-amber-600' : 'text-blue-600 dark:text-blue-400'
                )}>{s.value}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">{s.detail}</p>
              </div>
              
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none transition-transform duration-700 group-hover:scale-150 group-hover:rotate-45 translate-x-8 translate-y-[-8px]",
                s.color === 'emerald' ? "text-emerald-500" : s.color === 'amber' ? "text-amber-500" : "text-blue-500"
              )}>
                <s.icon size={128} />
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-0 border-none shadow-2xl bg-transparent">
          <DataTable
            columns={columns}
            data={attendants}
            searchable
            searchPlaceholder="Filter deployment by attendant name or ID..."
          />
        </Card>
      </div>
    </ProtectedRoute>
  );
}
