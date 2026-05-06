'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { CheckCircle2, XCircle, Clock, Eye, Search, Filter, CheckSquare } from 'lucide-react';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { DataTable } from '@/components/ui/DataTable';

export default function ApprovalsGovPage() {
  const approvals = [
    { id: '1', type: 'COUPON_REQUEST', entity: 'Ministry of Health', details: '5,000L Petrol', date: '2026-03-16', status: 'PENDING' },
    { id: '2', type: 'NEW_BENEFICIARY', entity: 'John Doe', details: 'ID: 123456789', date: '2026-03-15', status: 'PENDING', enrollmentDate: '2026-03-15' },
    { id: '3', type: 'STATION_REGISTRATION', entity: 'New Fuel Station X', details: 'Banjul Highway', date: '2026-03-12', status: 'APPROVED', stationCode: 'ST-BJL-001' },
    { id: '4', type: 'STATION_REGISTRATION', entity: 'Oryx Banjul', details: 'Kairaba Avenue', date: '2026-03-27', status: 'PENDING', stationCode: 'PENDING' },
  ];

  const stats = [
    { title: 'Pending Requests', value: '12', icon: Clock, color: 'amber' },
    { title: 'Approved (MTD)', value: '45', icon: CheckCircle2, color: 'emerald' },
    { title: 'Rejected (MTD)', value: '03', icon: XCircle, color: 'rose' },
  ];

  const columns = [
    {
      key: 'type',
      label: 'Request Type',
      render: (val: string) => (
        <Badge variant="info" className="font-black text-[9px] uppercase tracking-widest px-2 py-1">
          {val.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'entity',
      label: 'Entity / Requester',
      render: (val: string, item: any) => (
        <div className="flex flex-col">
          <span className="font-black text-slate-900 dark:text-white tracking-tight">{val}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-0.5 opacity-60">Ref: #{item.id}X90</span>
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (val: string, item: any) => (
        <div className="space-y-1">
          <p className="text-slate-500 font-bold italic text-xs">{val}</p>
          {item.type === 'STATION_REGISTRATION' && item.stationCode && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded text-blue-600 border border-blue-100 dark:border-blue-900/30 uppercase tracking-widest">Code: {item.stationCode}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Submission Date',
      render: (val: string) => <span className="text-slate-500 text-[11px] font-black uppercase tracking-tight">{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val: string) => (
        <div className="flex items-center gap-2.5">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            val === 'PENDING' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          )} />
          <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{val}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Control',
      render: (val: any, item: any) => (
        <div className="flex items-center gap-3">
          <button className="p-3 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-all hover:scale-110 active:scale-90" title="View Details">
            <Eye size={20} strokeWidth={2.5} />
          </button>
          {item.status === 'PENDING' && (
            <>
              {item.type === 'STATION_REGISTRATION' && (
                <div className="flex items-center gap-2 px-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 ml-1">
                  <input 
                    type="text" 
                    placeholder="ST-XXX" 
                    className="w-16 px-0 py-2 bg-transparent text-[10px] font-black text-blue-600 focus:outline-none uppercase tracking-widest"
                    defaultValue={item.stationCode === 'PENDING' ? '' : item.stationCode}
                  />
                  <button className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5 active:scale-95" title="Enroll at HQ">
                    <CheckSquare size={14} strokeWidth={3} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Enroll</span>
                  </button>
                </div>
              )}
              <button className="p-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500 transition-all hover:scale-110 active:scale-90" title="Approve">
                <CheckCircle2 size={20} strokeWidth={2.5} />
              </button>
              <button className="p-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-all hover:scale-110 active:scale-90" title="Reject">
                <XCircle size={20} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.GOVERNMENT_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Executive Queue</h1>
            <p className="text-slate-500 font-medium mt-2">Critical decision engine for coupons, personnel, and institutional registrations</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900 h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:bg-slate-50">
              Review History
            </Button>
            <Button variant="primary" size="lg" className="shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95">
              Secure Audit
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-10 border-none shadow-2xl relative overflow-hidden group bg-white dark:bg-slate-900 transition-all hover:translate-y-[-4px]">
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.title}</p>
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Live Requests</span>
                  </div>
                </div>
                <div className={cn(
                  "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl",
                  stat.color === 'amber' ? "bg-amber-600 text-white shadow-amber-500/20" :
                  stat.color === 'emerald' ? "bg-emerald-600 text-white shadow-emerald-500/20" :
                  "bg-rose-600 text-white shadow-rose-500/20"
                )}>
                  <stat.icon size={32} strokeWidth={2.5} />
                </div>
              </div>
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none transition-transform duration-700 group-hover:scale-150 group-hover:rotate-45 translate-x-8 translate-y-[-8px]",
                stat.color === 'amber' ? "text-amber-500" : stat.color === 'emerald' ? "text-emerald-500" : "text-rose-500"
              )}>
                <stat.icon size={128} />
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-0 border-none shadow-2xl bg-transparent">
          <DataTable
            columns={columns}
            data={approvals}
            searchable
            searchPlaceholder="Filter executive queue by entity or ID..."
          />
        </Card>
      </div>
    </ProtectedRoute>
  );
}
