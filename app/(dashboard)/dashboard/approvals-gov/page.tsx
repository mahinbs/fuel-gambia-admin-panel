'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { CheckCircle2, XCircle, Clock, Eye, Search, Filter, CheckSquare } from 'lucide-react';
import { cn } from '@/utils/cn';

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

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Approvals Management</h1>
          <p className="text-slate-500 font-medium mt-2">Review and process platform-wide requests and registrations</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="lg" className="bg-white dark:bg-slate-900 shadow-sm font-black text-xs uppercase tracking-widest">
            History
          </Button>
          <Button variant="primary" size="lg" className="shadow-blue-500/20 hover:shadow-xl transition-all">
            Audit Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-8 border-none shadow-xl relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
                  <span className="text-xs font-bold text-slate-400 italic">requests</span>
                </div>
              </div>
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                stat.color === 'amber' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500" :
                stat.color === 'emerald' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" :
                "bg-rose-50 dark:bg-rose-500/10 text-rose-500"
              )}>
                <stat.icon size={28} strokeWidth={2.5} />
              </div>
            </div>
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-transform group-hover:scale-150 rotate-12",
              stat.color === 'amber' ? "text-amber-500" : stat.color === 'emerald' ? "text-emerald-500" : "text-rose-500"
            )}>
              <stat.icon size={128} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 border-none shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search queue..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="bg-slate-50 dark:bg-slate-800/50">
              <Filter size={16} className="mr-2" />
              Request Type
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-800">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Request Type</TableHeader>
                <TableHeader>Entity / Requester</TableHeader>
                <TableHeader>Details</TableHeader>
                <TableHeader>Date Submitted</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader className="text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {approvals.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <Badge variant="info" size="sm" className="font-black">
                      {a.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">{a.entity}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Ref: #{a.id}X90</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 font-medium italic">
                    {a.details}
                    {a.type === 'STATION_REGISTRATION' && a.stationCode && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">CODE: {a.stationCode}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs font-bold">{a.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        a.status === 'PENDING' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      )} />
                      <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">{a.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors" title="View Details">
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                      {a.status === 'PENDING' && (
                        <>
                          {a.type === 'STATION_REGISTRATION' && (
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                placeholder="ST-XXX" 
                                className="w-20 px-2 py-1 text-[10px] font-black border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                defaultValue={a.stationCode === 'PENDING' ? '' : a.stationCode}
                              />
                              <button className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all flex items-center gap-1.5" title="Enroll at HQ">
                                <CheckSquare size={16} strokeWidth={3} />
                                <span className="text-[10px] font-black uppercase tracking-wider pr-1">Enroll</span>
                              </button>
                            </div>
                          )}
                          <button className="p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-500 transition-colors" title="Approve">
                            <CheckCircle2 size={18} strokeWidth={2.5} />
                          </button>
                          <button className="p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-colors" title="Reject">
                            <XCircle size={18} strokeWidth={2.5} />
                          </button>
                        </>
                      )}
                    </div>
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
