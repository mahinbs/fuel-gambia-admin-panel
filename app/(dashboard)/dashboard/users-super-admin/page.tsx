'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Users, UserPlus, Mail, Shield, Clock, MoreVertical, Edit2, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { AdminRole } from '@/types';
import { cn } from '@/utils/cn';

export default function UsersSuperAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const users = [
    { id: '1', name: 'Mustapha Sahil', email: 'mustapha@fuelgambia.com', role: AdminRole.SUPER_ADMIN, level: 'National', status: 'ACTIVE', lastLogin: '12 mins ago' },
    { id: '2', name: 'Alieu Jallow', email: 'alieu.j@gov.gm', role: AdminRole.GOVERNMENT_ADMIN, level: 'National', status: 'ACTIVE', lastLogin: '2 hours ago' },
    { id: '3', name: 'Fatou Bensouda', email: 'fatou@stationhq.com', role: AdminRole.STATION_HQ, level: 'HQ', status: 'INACTIVE', lastLogin: '3 days ago' },
    { id: '4', name: 'Modou Barrow', email: 'modou@station-banjul.com', role: AdminRole.STATION_BRANCH, level: 'Branch', status: 'ACTIVE', lastLogin: '5 mins ago' },
    { id: '5', name: 'Samba Diallo', email: 'samba.d@mobileapp.com', role: 'MOBILE_USER', level: 'Mobile App', status: 'ACTIVE', lastLogin: '1 hour ago' },
    { id: '6', name: 'Bakary Jatta', email: 'bakary@station-hq.com', role: 'PUMP_ATTENDANT', level: 'Branch', status: 'ACTIVE', lastLogin: '12 mins ago' },
    { id: '7', name: 'Isatou Touray', email: 'isatou@institution-health.com', role: 'INSTITUTION_USER', level: 'Institution', status: 'PENDING', lastLogin: 'Never' },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
        return <Badge variant="outline" size="sm" className="border-none bg-transparent text-blue-600 font-black text-[9px] px-0">SUPER ADMIN</Badge>;
      case AdminRole.GOVERNMENT_ADMIN:
        return <Badge variant="outline" size="sm" className="border-none bg-transparent text-purple-600 font-black text-[9px] px-0">GOVT OFFICER</Badge>;
      case AdminRole.STATION_HQ:
        return <Badge variant="outline" size="sm" className="border-none bg-transparent text-indigo-600 font-black text-[9px] px-0">STATION HQ</Badge>;
      case AdminRole.STATION_BRANCH:
        return <Badge variant="outline" size="sm" className="border-none bg-transparent text-emerald-600 font-black text-[9px] px-0">STATION BRANCH</Badge>;
      case 'MOBILE_USER':
        return <Badge variant="outline" size="sm" className="border-none bg-transparent text-blue-500 font-black text-[9px] px-0">MOBILE USER</Badge>;
      case 'PUMP_ATTENDANT':
        return <Badge variant="outline" size="sm" className="border-none bg-transparent text-amber-600 font-black text-[9px] px-0">PUMP ATTENDANT</Badge>;
      case 'INSTITUTION_USER':
        return <Badge variant="outline" size="sm" className="border-none bg-transparent text-amber-600 font-black text-[9px] px-0">INSTITUTION</Badge>;
      default:
        return <Badge variant="outline" size="sm" className="border-none bg-transparent font-black text-slate-500 text-[9px] px-0">STAFF</Badge>;
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Access Control</h1>
          <p className="text-slate-500 font-medium mt-2">Manage administrative privileges and internal platform users</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <UserPlus size={20} className="mr-2" strokeWidth={3} />
          Add Internal User
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-none shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHead className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity & Contact</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Security Role</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Access Level</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Account status</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Session</TableHeader>
                <TableHeader className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Management</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="group hover:bg-white dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400">
                        {u.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 dark:text-white tracking-tight">{u.name}</span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Mail size={10} /> {u.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    {getRoleBadge(u.role)}
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{u.level}</span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full shadow-[0_0_8px]",
                        u.status === 'ACTIVE' ? "bg-emerald-500 shadow-emerald-500/50" : "bg-slate-300 shadow-slate-300/50"
                      )} />
                      <span className="text-xs font-black text-slate-600 dark:text-slate-400 tracking-tighter uppercase">{u.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <Clock size={12} /> {u.lastLogin}
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors"><Edit2 size={16} /></button>
                      <button className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 transition-colors"><Trash2 size={16} /></button>
                    </div>
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
        title="Provision Platform Access"
        size="md"
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <Input label="Staff Full Name" placeholder="e.g. John Dramani" />
            <Input label="Corporate Email" type="email" placeholder="staff@fuelgambia.gm" />
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">Administrative Role</label>
              <select className="w-full h-14 px-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none">
                <option value={AdminRole.SUPER_ADMIN}>Super Administrator</option>
                <option value={AdminRole.GOVERNMENT_ADMIN}>Government Officer</option>
                <option value={AdminRole.STATION_HQ}>Station HQ Manager</option>
                <option value={AdminRole.STATION_BRANCH}>Station Branch Manager</option>
                <option value="MOBILE_USER">Mobile App User</option>
                <option value="PUMP_ATTENDANT">Pump Attendant</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/10 flex gap-3">
            <Shield className="text-amber-600 shrink-0" size={18} />
            <p className="text-[10px] font-bold text-amber-800/80 dark:text-amber-500/80 leading-relaxed uppercase tracking-wider">
              Granting administrative access allows this user to view sensitive national fuel distribution data.
            </p>
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="outline" className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1 py-4 rounded-xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
