'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Users, Plus, Mail, Phone, Calendar, MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function StaffBranchPage() {
  const staff = [
    { id: '1', name: 'Isatou Ceesay', role: 'Pump Attendant', status: 'ON_SHIFT', joined: 'Jan 2024', email: 'isatou@fuel.gm', phone: '+220 334 5566' },
    { id: '2', name: 'Modou Lamin', role: 'Station Supervisor', status: 'OFF_SHIFT', joined: 'Nov 2023', email: 'modou@fuel.gm', phone: '+220 998 7766' },
    { id: '3', name: 'Alfie Jallow', role: 'Pump Attendant', status: 'ON_SHIFT', joined: 'Mar 2024', email: 'alfie@fuel.gm', phone: '+220 445 6677' },
  ];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Staff Directory</h1>
          <p className="text-slate-500 font-medium mt-2">Manage all employees assigned to this branch location</p>
        </div>
        <Button variant="primary" size="lg" className="shadow-blue-500/20 hover:shadow-xl transition-all">
          <Plus size={20} className="mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search staff members..." 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <Card key={member.id} className="p-8 border-none shadow-xl group hover:shadow-2xl transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900",
                  member.status === 'ON_SHIFT' ? "bg-emerald-500" : "bg-slate-300"
                )} />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <MoreHorizontal size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{member.name}</h3>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{member.role}</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <Mail size={16} />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <Phone size={16} />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <Calendar size={16} />
                <span>Joined {member.joined}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Badge variant={member.status === 'ON_SHIFT' ? 'success' : 'default'} size="sm">
                {member.status.replace('_', ' ')}
              </Badge>
              <Button variant="ghost" size="sm" className="text-blue-500 font-bold">
                Performance
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
