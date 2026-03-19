'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { UserCog, Activity, Coffee, Droplets, TrendingUp, Search, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function AttendantsBranchPage() {
  const attendants = [
    { id: '1', name: 'Musa Faal', pump: 'Pump A', status: 'ON_DUTY', dispensed: '1,240 L', transactions: 34, shift: 'Morning' },
    { id: '2', name: 'Binta Drammeh', pump: 'Pump B', status: 'ON_BREAK', dispensed: '860 L', transactions: 21, shift: 'Morning' },
    { id: '3', name: 'Ousman Bah', pump: 'Pump C', status: 'ON_DUTY', dispensed: '1,050 L', transactions: 28, shift: 'Morning' },
    { id: '4', name: 'Fatima Jallow', pump: 'Pump A', status: 'UPCOMING', dispensed: '—', transactions: 0, shift: 'Evening' },
  ];

  const statusConfig: Record<string, { label: string; variant: any; dot: string }> = {
    ON_DUTY: { label: 'On Duty', variant: 'success', dot: 'bg-emerald-500' },
    ON_BREAK: { label: 'On Break', variant: 'warning', dot: 'bg-amber-500' },
    UPCOMING: { label: 'Upcoming', variant: 'info', dot: 'bg-blue-500' },
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Pump Attendants</h1>
          <p className="text-slate-500 font-medium mt-2">Real-time status and performance tracking for all on-duty attendants</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 border-2 font-black" onClick={() => alert('Refreshing attendant status...')}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'On Duty', value: attendants.filter(a => a.status === 'ON_DUTY').length, icon: Activity, color: 'emerald' },
          { label: 'On Break', value: attendants.filter(a => a.status === 'ON_BREAK').length, icon: Coffee, color: 'amber' },
          { label: 'Total Dispensed', value: '3,150 L', icon: Droplets, color: 'blue' },
        ].map((s) => (
          <Card key={s.label} className="p-6 border-none shadow-xl relative overflow-hidden group">
            <div className={cn(
              'p-3 rounded-2xl w-fit mb-4 transition-transform group-hover:scale-110',
              s.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
              s.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
              'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
            )}>
              <s.icon size={22} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={cn('text-3xl font-black tracking-tight mt-1',
              s.color === 'emerald' ? 'text-emerald-600' : s.color === 'amber' ? 'text-amber-600' : 'text-blue-600'
            )}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCog className="text-blue-600" size={22} />
            On-Duty Attendants
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              placeholder="Search attendants..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHead className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Attendant</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Pump</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Shift</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Fuel Dispensed</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Transactions</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendants.map((a) => (
                <TableRow key={a.id} className="group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center font-black text-blue-700 dark:text-blue-400 text-sm">
                          {a.name.charAt(0)}
                        </div>
                        <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900', statusConfig[a.status]?.dot)} />
                      </div>
                      <p className="font-black text-slate-900 dark:text-white text-sm">{a.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{a.pump}</span>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-sm font-bold text-slate-500">{a.shift}</TableCell>
                  <TableCell className="py-5 px-6 font-black text-blue-600 dark:text-blue-400">{a.dispensed}</TableCell>
                  <TableCell className="py-5 px-6 font-black text-slate-900 dark:text-white">{a.transactions > 0 ? a.transactions : '—'}</TableCell>
                  <TableCell className="py-5 px-6">
                    <Badge variant={statusConfig[a.status]?.variant || 'default'} size="sm" className="font-black">
                      {statusConfig[a.status]?.label || a.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
