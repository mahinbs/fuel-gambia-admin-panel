'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { Users, UserPlus, Shield, Mail, Phone, MoreHorizontal, Building2, TrendingUp, Search, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { adminUserFunctions, stationFunctions, supabase, createRegisterClient } from '@/supabase';

export default function StaffHQPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    password: '',
  });

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminUserFunctions.getAdminProfiles();
      const hqStaff = result.filter((p: any) =>
        p.role === 'STATION_BRANCH' || p.role === 'ATTENDANT'
      );
      setStaff(search ? hqStaff.filter((s: any) => (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.email || '').toLowerCase().includes(search.toLowerCase())) : hqStaff);
    } catch (err: any) {
      setError(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      alert('Name, Email, Password and Role are required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const registerClient = createRegisterClient();

      const { data: authData, error: authError } = await registerClient.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: formData.role,
            phone_number: formData.phone || null,
            is_verified: false,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create authentication account.');

      const newUserId = authData.user.id;

      if (formData.role === 'ATTENDANT') {
        const { error: attendantErr } = await supabase
          .from('attendants')
          .insert({
            id: newUserId,
            employee_id: `ATT-${Date.now()}`,
            status: 'ACTIVE'
          });
        if (attendantErr) throw attendantErr;
      } else {
        const { error: staffErr } = await supabase
          .from('staff')
          .insert({
            id: newUserId,
            employee_id: `STF-${Date.now()}`,
            position: 'BRANCH_MANAGER',
            status: 'ACTIVE'
          });
        if (staffErr) throw staffErr;
      }

      await loadStaff();
      setIsModalOpen(false);
      setFormData({ name: '', role: '', email: '', phone: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to register staff');
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel: Record<string, string> = {
    STATION_BRANCH: 'Station Manager',
    ATTENDANT: 'Pump Attendant',
  };

  const roleBadgeColor: Record<string, string> = {
    STATION_BRANCH: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    ATTENDANT: 'bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">HQ Staff Management</h1>
          <p className="text-slate-500 font-medium mt-2">Manage all network station managers and pump attendants</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <UserPlus size={20} className="mr-2" strokeWidth={3} />
          Add Staff Member
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
          <AlertCircle className="text-rose-500 shrink-0" size={20} />
          <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs font-black uppercase">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Staff', value: loading ? '—' : String(staff.length), icon: Users, color: 'blue' },
          { label: 'Station Managers', value: loading ? '—' : String(staff.filter(s => s.role === 'STATION_BRANCH').length), icon: Shield, color: 'purple' },
          { label: 'Pump Attendants', value: loading ? '—' : String(staff.filter(s => s.role === 'ATTENDANT').length), icon: Users, color: 'emerald' },
        ].map((stat) => (
          <Card key={stat.label} className="p-6 border-none shadow-xl relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className={cn(
                'p-3 rounded-2xl transition-transform group-hover:scale-110',
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
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
            Staff & Manager Directory
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow>
                  <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Staff Member</TableHeader>
                  <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</TableHeader>
                  <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</TableHeader>
                  <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHeader>
                  <TableHeader className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-bold">
                      No staff found
                    </TableCell>
                  </TableRow>
                ) : staff.map((s: any) => (
                  <TableRow key={s.id} className="group hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center font-black text-blue-700 dark:text-blue-400 text-sm">
                          {(s.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">{s.name || 'Unknown'}</p>
                          <p className="text-[10px] font-bold text-slate-400">{s.id?.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <span className={cn('px-2 py-1 rounded-lg text-[10px] font-black', roleBadgeColor[s.role] || 'bg-slate-100 text-slate-600')}>
                        {roleLabel[s.role] || s.role || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="space-y-1">
                        {s.email && <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><Mail size={11} /> {s.email}</p>}
                        {s.phone_number && <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Phone size={11} /> {s.phone_number}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <Badge variant={s.is_active !== false ? 'success' : 'warning'} size="sm" className="font-black">
                        {s.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
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
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Staff Member" size="lg">
        <form className="space-y-6" onSubmit={handleCreateStaff}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" placeholder="e.g. Momodou Ceesay" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Role</label>
              <select className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                <option value="">Select Role</option>
                <option value="STATION_BRANCH">Station Manager</option>
                <option value="ATTENDANT">Pump Attendant</option>
              </select>
            </div>
            <Input label="Official Email" type="email" placeholder="name@fuelstation.gm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <Input label="Phone" placeholder="+220 7XX XXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            <Input label="Temporary Password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          </div>
          <div className="pt-4 flex gap-4">
            <Button variant="outline" type="button" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={submitting} className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest">
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              {submitting ? 'Creating...' : 'Create Staff Member'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
