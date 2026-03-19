'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { UserPlus, Users, Pencil, Trash2, PowerOff, MoreHorizontal, Search, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

type Staff = {
  id: string;
  name: string;
  role: string;
  phone: string;
  shift: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'DEACTIVATED';
};

export default function OnboardingBranchPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const [staffList, setStaffList] = useState<Staff[]>([
    { id: '1', name: 'Musa Faal', role: 'Pump Attendant', phone: '+220 771XXXX', shift: 'Morning', status: 'ACTIVE' },
    { id: '2', name: 'Binta Drammeh', role: 'Cashier', phone: '+220 772XXXX', shift: 'Evening', status: 'ACTIVE' },
    { id: '3', name: 'Lamin Ceesay', role: 'Security', phone: '+220 773XXXX', shift: 'Night', status: 'ON_LEAVE' },
  ]);

  const handleDeactivate = (id: string) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'DEACTIVATED' ? 'ACTIVE' : 'DEACTIVATED' } : s));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaffList(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Staff Onboarding</h1>
          <p className="text-slate-500 font-medium mt-2">Register, manage, and track all station branch staff</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={openAddModal}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <UserPlus size={20} className="mr-2" strokeWidth={3} />
          Add Staff Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Staff', value: staffList.length, color: 'blue', sub: 'Registered' },
          { label: 'Active', value: staffList.filter(s => s.status === 'ACTIVE').length, color: 'emerald', sub: 'On duty eligible' },
          { label: 'On Leave / Deactivated', value: staffList.filter(s => s.status !== 'ACTIVE').length, color: 'amber', sub: 'Unavailable' },
        ].map((s) => (
          <Card key={s.label} className="p-6 border-none shadow-xl relative overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={cn('text-4xl font-black tracking-tight mt-2', s.color === 'blue' ? 'text-blue-600' : s.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600')}>{s.value}</p>
            <p className="text-xs font-bold text-slate-400 mt-1">{s.sub}</p>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4 justify-between">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="text-blue-600" size={22} />
            Branch Staff Directory
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
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
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Shift</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHeader>
                <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffList.map((s) => (
                <TableRow key={s.id} className={cn('group transition-colors', s.status === 'DEACTIVATED' && 'opacity-50')}>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center font-black text-blue-700 dark:text-blue-400 text-sm">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-sm">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">ID: BR-{s.id}0{parseInt(s.id) * 7}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                      {s.role}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6 text-sm font-bold text-slate-500">{s.phone}</TableCell>
                  <TableCell className="py-5 px-6">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {s.shift}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <Badge
                      variant={s.status === 'ACTIVE' ? 'success' : s.status === 'ON_LEAVE' ? 'warning' : 'error'}
                      size="sm"
                      className="font-black"
                    >
                      {s.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors text-blue-500"
                        onClick={() => handleEdit(s)}
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className={cn('p-2 rounded-xl transition-colors', s.status === 'DEACTIVATED' ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20')}
                        onClick={() => handleDeactivate(s.id)}
                        title={s.status === 'DEACTIVATED' ? 'Reactivate' : 'Deactivate'}
                      >
                        <PowerOff size={16} />
                      </button>
                      <button
                        className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors text-rose-500"
                        onClick={() => handleDelete(s.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
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
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
        size="lg"
      >
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" placeholder="e.g. Momodou Ceesay" defaultValue={editingStaff?.name} />
            <Input label="Phone Number" placeholder="+220 7XX XXXX" defaultValue={editingStaff?.phone} />
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Role</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10">
                <option value="pump_attendant">Pump Attendant</option>
                <option value="cashier">Cashier</option>
                <option value="security">Security</option>
                <option value="supervisor">Shift Supervisor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Shift Preference</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10">
                <option>Morning (06:00–14:00)</option>
                <option>Evening (14:00–22:00)</option>
                <option>Night (22:00–06:00)</option>
              </select>
            </div>
            <Input label="National ID Number" placeholder="GM-XXXXXXXX" />
            <Input label="Emergency Contact" placeholder="+220 7XX XXXX" />
          </div>
          <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex gap-3">
            <ShieldCheck className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs font-medium text-blue-800 dark:text-blue-400 leading-relaxed">
              By registering this staff member, you confirm they have passed the required background check and safety training.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" onClick={() => setIsModalOpen(false)}>
              {editingStaff ? 'Save Changes' : 'Register Staff'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
