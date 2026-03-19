'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Users, UserPlus, Shield, Mail, Phone, MoreHorizontal, Building2, TrendingUp, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function StaffHQPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const staff = [
    { id: '1', name: 'Ousainou Sarr', role: 'Corporate Auditor', email: 'o.sarr@fuelstation.gm', phone: '+220 772XXXX', status: 'ACTIVE', stations: 3 },
    { id: '2', name: 'Binta Njie', role: 'Regional Manager', email: 'b.njie@fuelstation.gm', phone: '+220 773XXXX', status: 'ACTIVE', stations: 5 },
    { id: '3', name: 'Lamin Sanyang', role: 'Operations Lead', email: 'l.sanyang@fuelstation.gm', phone: '+220 774XXXX', status: 'ON_LEAVE', stations: 2 },
    { id: '4', name: 'Fatou Jallow', role: 'Financial Controller', email: 'f.jallow@fuelstation.gm', phone: '+220 775XXXX', status: 'ACTIVE', stations: 4 },
  ];

  const roleBadgeColor: Record<string, string> = {
    'Corporate Auditor': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    'Regional Manager': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    'Operations Lead': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    'Financial Controller': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">HQ Staff Management</h1>
          <p className="text-slate-500 font-medium mt-2">Manage corporate staff, regional managers, and field controllers</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <UserPlus size={20} className="mr-2" strokeWidth={3} />
          Add Corporate User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total HQ Staff', value: '24', icon: Users, color: 'blue' },
          { label: 'Regional Managers', value: '6', icon: Shield, color: 'purple' },
          { label: 'On Leave Today', value: '2', icon: TrendingUp, color: 'amber' },
        ].map((stat) => (
          <Card key={stat.label} className="p-6 border-none shadow-xl relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className={cn(
                'p-3 rounded-2xl transition-transform group-hover:scale-110',
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
              )}>
                <stat.icon size={22} />
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="text-blue-600" size={22} />
            Corporate & Manager Directory
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search staff..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHead className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Staff Member</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Stations</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right truncate">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((s) => (
                <TableRow key={s.id} className="group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center font-black text-blue-700 dark:text-blue-400 text-sm">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-sm">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">ID: HQ-{s.id}0{parseInt(s.id)*3}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className={cn('px-2 py-1 rounded-lg text-[10px] font-black', roleBadgeColor[s.role] || 'bg-slate-100 text-slate-600')}>
                      {s.role}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Mail size={11} /> {s.email}</p>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Phone size={11} /> {s.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6 font-black text-blue-600 dark:text-blue-400">{s.stations} stations</TableCell>
                  <TableCell className="py-5 px-6">
                    <Badge variant={s.status === 'ACTIVE' ? 'success' : 'warning'} size="sm" className="font-black">
                      {s.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                      <MoreHorizontal size={18} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Corporate User"
        size="lg"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" placeholder="e.g. Momodou Ceesay" />
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Corporate Role</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all">
                <option value="">Select Role</option>
                <option value="regional_manager">Regional Manager</option>
                <option value="corporate_auditor">Corporate Auditor</option>
                <option value="operations_lead">Operations Lead</option>
                <option value="financial_controller">Financial Controller</option>
                <option value="station_manager">Station Manager</option>
              </select>
            </div>
            <Input label="Official Email" type="email" placeholder="name@fuelstation.gm" />
            <Input label="Phone" placeholder="+220 7XX XXXX" />
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Assigned Stations</label>
              <div className="flex flex-wrap gap-2">
                {['Banjul Central', 'Serrekunda East', 'Bakau Metro', 'Lamin Station'].map((s) => (
                  <button key={s} type="button" className="px-3 py-1.5 border-2 border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" onClick={() => setIsModalOpen(false)}>
              Create Corporate User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
