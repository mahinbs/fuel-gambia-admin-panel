'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { DollarSign, Download, TrendingUp, ArrowUpRight, ArrowDownRight, Building2, Calendar, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';

export default function IncomeSuperAdminPage() {
  const transactions = [
    { id: '1', company: 'Telco A', amount: 500000, date: '2026-03-15', status: 'RECEIVED', method: 'Bank Transfer' },
    { id: '2', company: 'Bank B', amount: 750000, date: '2026-03-14', status: 'PENDING', method: 'Corporate Card' },
    { id: '3', company: 'Utility C', amount: 250000, date: '2026-03-12', status: 'RECEIVED', method: 'Mobile Money' },
    { id: '4', company: 'Mining Corp', amount: 1250000, date: '2026-03-10', status: 'RECEIVED', method: 'Bank Transfer' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Financial Oversight</h1>
          <p className="text-slate-500 font-medium mt-2">Monitor national fuel subsidy income and institutional payments</p>
        </div>
        <Button 
          variant="outline" 
          size="lg" 
          className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all border-slate-200 dark:border-slate-800"
        >
          <Download size={20} className="mr-2 text-blue-600" />
          Export Financial Audit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group border-none bg-gradient-to-br from-blue-600 to-indigo-700 p-8 shadow-blue-500/20 shadow-xl">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <DollarSign className="text-white" size={24} />
              </div>
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg backdrop-blur-md">
                <ArrowUpRight size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black text-white">+12.5%</span>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1 opacity-80">Total Income (MTD)</p>
              <p className="text-4xl font-black text-white tracking-tight">{formatCurrency(2500000)}</p>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </Card>

        <Card className="relative overflow-hidden group border-none bg-white dark:bg-slate-900 p-8 shadow-2xl">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl transition-transform group-hover:rotate-6 duration-300">
                <TrendingUp className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
              <Badge variant="warning" size="sm">7 New Pending</Badge>
            </div>
            <div className="mt-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Receivables</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(750000)}</p>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group border-none bg-white dark:bg-slate-900 p-8 shadow-2xl">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl transition-transform group-hover:-rotate-6 duration-300">
                <CreditCard className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <Badge variant="success" size="sm">Verified</Badge>
            </div>
            <div className="mt-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational Revenue</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(12450000)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Institutional Transaction Ledger" className="p-0 overflow-hidden border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHead className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Partner Institution</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Gross Amount</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Window</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Channel</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Clearance Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id} className="group hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="py-5 px-6 font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                      <Building2 size={16} />
                    </div>
                    {t.company}
                  </TableCell>
                  <TableCell className="py-5 px-6 text-sm font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrency(t.amount)}
                  </TableCell>
                  <TableCell className="py-5 px-6 text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Calendar size={14} /> {t.date}
                  </TableCell>
                  <TableCell className="py-5 px-6 text-xs font-bold text-slate-500 uppercase tracking-tighter italic">
                    {t.method}
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <Badge variant={t.status === 'RECEIVED' ? 'success' : 'warning'} size="sm" className="font-black">
                      {t.status}
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
