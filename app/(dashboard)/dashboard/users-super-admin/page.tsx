'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Users, UserPlus, Mail, Shield, Clock, MoreVertical, Edit2, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { AdminRole } from '@/types';
import { cn } from '@/utils/cn';

import { ProtectedRoute } from '@/navigation/ProtectedRoute';

export default function UsersSuperAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [users, setUsers] = useState([
    { id: '1', name: 'Mustapha Sahil', email: 'mustapha@fuelgambia.com', role: AdminRole.SUPER_ADMIN, level: 'National', status: 'ACTIVE', lastLogin: '12 mins ago' },
    { id: '2', name: 'Alieu Jallow', email: 'alieu.j@gov.gm', role: AdminRole.GOVERNMENT_ADMIN, level: 'National', status: 'ACTIVE', lastLogin: '2 hours ago' },
    { id: '3', name: 'Fatou Bensouda', email: 'fatou@stationhq.com', role: AdminRole.STATION_HQ, level: 'HQ', status: 'INACTIVE', lastLogin: '3 days ago' },
    { id: '4', name: 'Modou Barrow', email: 'modou@station-banjul.com', role: AdminRole.STATION_BRANCH, level: 'Branch', status: 'ACTIVE', lastLogin: '5 mins ago' },
    { id: '5', name: 'Samba Diallo', email: 'samba.d@mobileapp.com', role: 'MOBILE_USER', level: 'Mobile App', status: 'ACTIVE', lastLogin: '1 hour ago' },
    { id: '6', name: 'Bakary Jatta', email: 'bakary@station-hq.com', role: 'PUMP_ATTENDANT', level: 'Branch', status: 'ACTIVE', lastLogin: '12 mins ago' },
    { id: '7', name: 'Isatou Touray', email: 'isatou@institution-health.com', role: 'INSTITUTION_USER', level: 'Institution', status: 'PENDING', lastLogin: 'Never' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: AdminRole.SUPER_ADMIN,
    level: 'National'
  });

  const handleProvision = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: (users.length + 1).toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      level: formData.role === AdminRole.STATION_BRANCH ? 'Branch' : 'National',
      status: 'ACTIVE',
      lastLogin: 'Never'
    };
    setUsers([...users, newUser]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: AdminRole.SUPER_ADMIN, level: 'National' });
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      level: user.level
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
    setIsEditModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to revoke access for this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Identity & Contact',
      render: (val: string, row: any) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-500 dark:text-slate-400">
            {val.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 dark:text-white tracking-tight">{val}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Mail size={10} /> {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Security Role',
      render: (role: string) => {
        const roleStyles: Record<string, string> = {
          [AdminRole.SUPER_ADMIN]: 'text-blue-600',
          [AdminRole.GOVERNMENT_ADMIN]: 'text-purple-600',
          [AdminRole.STATION_HQ]: 'text-indigo-600',
          [AdminRole.STATION_BRANCH]: 'text-emerald-600',
          'MOBILE_USER': 'text-blue-500',
          'PUMP_ATTENDANT': 'text-amber-600',
          'INSTITUTION_USER': 'text-rose-500',
        };
        return (
          <span className={cn("text-[10px] font-black uppercase tracking-widest", roleStyles[role] || 'text-slate-500')}>
            {role.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'level',
      label: 'Access Level',
      render: (val: string) => (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            val === 'ACTIVE' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
          )} />
          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{val}</span>
        </div>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Session',
      render: (val: string) => (
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <Clock size={12} /> {val}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: any) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => handleEdit(row)}
            className="p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors"
          >
            <Edit2 size={18} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => handleDelete(row.id)}
            className="p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 transition-colors"
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute requiredRole={AdminRole.SUPER_ADMIN}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Access Control</h1>
            <p className="text-slate-500 font-medium mt-2">Manage administrative privileges and platform security</p>
          </div>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => setIsModalOpen(true)}
            className="shadow-blue-500/20 hover:shadow-xl transition-all h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
          >
            <UserPlus size={20} className="mr-2" strokeWidth={3} />
            Provision Access
          </Button>
        </div>

        <Card className="p-0 border-none shadow-2xl overflow-visible bg-transparent">
          <DataTable
            columns={columns}
            data={users}
            searchable
            searchPlaceholder="Search by name, email, or role..."
            className="bg-transparent"
          />
        </Card>

        {/* Provision Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Provision Platform Access"
          size="md"
        >
          <form className="space-y-8" onSubmit={handleProvision}>
            <div className="space-y-6">
              <Input 
                label="Staff Full Name" 
                placeholder="e.g. John Dramani" 
                className="h-14 rounded-2xl font-bold"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input 
                label="Corporate Email" 
                type="email" 
                placeholder="staff@fuelgambia.gm" 
                className="h-14 rounded-2xl font-bold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.2em]">Administrative Role</label>
                <select 
                  className="w-full h-14 px-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as AdminRole})}
                >
                  <option value={AdminRole.SUPER_ADMIN}>Super Administrator</option>
                  <option value={AdminRole.GOVERNMENT_ADMIN}>Government Officer</option>
                  <option value={AdminRole.STATION_HQ}>Station HQ Manager</option>
                  <option value={AdminRole.STATION_BRANCH}>Station Branch Manager</option>
                  <option value="MOBILE_USER">Mobile App User</option>
                  <option value="PUMP_ATTENDANT">Pump Attendant</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-amber-50/50 dark:bg-amber-500/5 rounded-3xl border border-amber-100 dark:border-amber-500/10 flex gap-4">
              <Shield className="text-amber-600 shrink-0" size={24} strokeWidth={2.5} />
              <div>
                <p className="text-[10px] font-black text-amber-900 dark:text-amber-400 uppercase tracking-widest mb-1">Security Protocol</p>
                <p className="text-[10px] font-bold text-amber-800/80 dark:text-amber-500/80 leading-relaxed uppercase tracking-wider">
                  Granting administrative access allows this user to view sensitive national fuel distribution and audit data.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" type="button" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]">
                Confirm & Create
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Access Profile"
          size="md"
        >
          <form className="space-y-8" onSubmit={handleUpdate}>
            <div className="space-y-6">
              <Input 
                label="Staff Full Name" 
                className="h-14 rounded-2xl font-bold"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <Input 
                label="Corporate Email" 
                type="email" 
                className="h-14 rounded-2xl font-bold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-[0.2em]">Administrative Role</label>
                <select 
                  className="w-full h-14 px-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as AdminRole})}
                >
                  <option value={AdminRole.SUPER_ADMIN}>Super Administrator</option>
                  <option value={AdminRole.GOVERNMENT_ADMIN}>Government Officer</option>
                  <option value={AdminRole.STATION_HQ}>Station HQ Manager</option>
                  <option value={AdminRole.STATION_BRANCH}>Station Branch Manager</option>
                  <option value="MOBILE_USER">Mobile App User</option>
                  <option value="PUMP_ATTENDANT">Pump Attendant</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" type="button" className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="flex-1 h-16 rounded-2xl shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-[10px]">
                Update Profile
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
