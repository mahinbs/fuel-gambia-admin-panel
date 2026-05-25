'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { UserPlus, Users, Pencil, Trash2, PowerOff, Search, ShieldCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { supabase, createRegisterClient } from '@/supabase';
import { useAppSelector } from '@/store/hooks';

type Staff = {
  id: string;
  name: string;
  role: string;
  roleKey: string;
  phone: string;
  email: string;
  shift: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'DEACTIVATED';
  employeeId: string;
};

export default function OnboardingBranchPage() {
  const { user } = useAppSelector((state: any) => state.auth || {});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'pump_attendant',
    shift: 'Flexible',
    nationalId: '',
    emergencyContact: ''
  });

  const loadStaff = useCallback(async () => {
    if (!user?.stationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch attendants
      const { data: attendantsData, error: attendantsErr } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          phone_number,
          is_active,
          created_at,
          attendants!inner(station_id, employee_id, status)
        `)
        .eq('attendants.station_id', user.stationId);

      if (attendantsErr) throw attendantsErr;

      // 2. Fetch other staff
      const { data: staffData, error: staffErr } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          phone_number,
          is_active,
          created_at,
          staff!inner(station_id, employee_id, position, status)
        `)
        .eq('staff.station_id', user.stationId);

      if (staffErr) throw staffErr;

      // Format combined list
      const formattedAttendants = (attendantsData || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        email: a.email || 'N/A',
        role: 'Pump Attendant',
        roleKey: 'pump_attendant',
        phone: a.phone_number || 'N/A',
        shift: 'Flexible',
        status: (a.is_active ? 'ACTIVE' : 'DEACTIVATED') as any,
        employeeId: a.attendants?.[0]?.employee_id || a.id
      }));

      const formattedStaff = (staffData || []).map((s: any) => {
        const pos = s.staff?.[0]?.position || 'Staff';
        let displayRole = 'Staff';
        if (pos === 'CASHIER') displayRole = 'Cashier';
        else if (pos === 'SECURITY') displayRole = 'Security';
        else if (pos === 'SUPERVISOR') displayRole = 'Shift Supervisor';

        return {
          id: s.id,
          name: s.name,
          email: s.email || 'N/A',
          role: displayRole,
          roleKey: pos.toLowerCase(),
          phone: s.phone_number || 'N/A',
          shift: 'Flexible',
          status: (s.is_active ? 'ACTIVE' : 'DEACTIVATED') as any,
          employeeId: s.staff?.[0]?.employee_id || s.id
        };
      });

      const combined = [...formattedAttendants, ...formattedStaff];
      setStaffList(combined);
    } catch (err: any) {
      console.error('Error loading staff:', err);
      setError(err.message || 'Failed to load staff list');
    } finally {
      setLoading(false);
    }
  }, [user?.stationId]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleDeactivate = async (id: string, currentStatus: string) => {
    try {
      setError(null);
      const newActive = currentStatus !== 'ACTIVE';
      const { error: err } = await supabase
        .from('profiles')
        .update({ is_active: newActive })
        .eq('id', id);
      if (err) throw err;
      await loadStaff();
    } catch (err: any) {
      setError(err.message || 'Failed to change staff status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      try {
        setError(null);
        const { error: err } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
        if (err) throw err;
        await loadStaff();
      } catch (err: any) {
        setError(err.message || 'Failed to delete staff member');
      }
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone === 'N/A' ? '' : staff.phone,
      password: '',
      role: staff.roleKey || 'pump_attendant',
      shift: staff.shift || 'Flexible',
      nationalId: '',
      emergencyContact: ''
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'pump_attendant',
      shift: 'Flexible',
      nationalId: '',
      emergencyContact: ''
    });
    setIsModalOpen(true);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) {
      alert('Name, Email and Password are required');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const registerClient = createRegisterClient();

      // 1. Sign up user in Auth
      const { data: authData, error: authError } = await registerClient.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            role: 'ATTENDANT', // profiles role must be ATTENDANT for app login
            phone_number: formData.phone || null,
            is_verified: false, // force reset on first login
            government_id: formData.nationalId || null
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Failed to create authentication account.');
      }

      const newUserId = authData.user.id;

      // 2. Insert into specific table based on role
      if (formData.role === 'pump_attendant') {
        const { error: attendantErr } = await supabase
          .from('attendants')
          .insert({
            id: newUserId,
            station_id: user.stationId,
            employee_id: `ATT-${Date.now()}`,
            status: 'ACTIVE'
          });
        if (attendantErr) throw attendantErr;
      } else {
        const { error: staffErr } = await supabase
          .from('staff')
          .insert({
            id: newUserId,
            station_id: user.stationId,
            employee_id: `STF-${Date.now()}`,
            position: formData.role.toUpperCase(),
            status: 'ACTIVE'
          });
        if (staffErr) throw staffErr;
      }

      await loadStaff();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone_number: formData.phone || null,
        })
        .eq('id', editingStaff.id);
      if (err) throw err;

      if (editingStaff.roleKey !== 'pump_attendant' && formData.role !== 'pump_attendant') {
        await supabase
          .from('staff')
          .update({ position: formData.role.toUpperCase() })
          .eq('id', editingStaff.id);
      }

      await loadStaff();
      setIsModalOpen(false);
      setEditingStaff(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update staff');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStaff = staffList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Staff Onboarding</h1>
          <p className="text-slate-500 font-medium mt-2">Register, manage, and track all station branch staff</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={loadStaff} disabled={loading}>
            <RefreshCw size={18} className={cn(loading && 'animate-spin')} />
            Refresh
          </Button>
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
          { label: 'Total Staff', value: loading ? '—' : staffList.length, color: 'blue', sub: 'Registered' },
          { label: 'Active', value: loading ? '—' : staffList.filter(s => s.status === 'ACTIVE').length, color: 'emerald', sub: 'On duty eligible' },
          { label: 'Deactivated', value: loading ? '—' : staffList.filter(s => s.status !== 'ACTIVE').length, color: 'amber', sub: 'Unavailable' },
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <Users size={36} className="text-slate-300" />
            <p className="text-slate-400 font-bold">No staff members found.</p>
          </div>
        ) : (
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
                {filteredStaff.map((s) => (
                  <TableRow key={s.id} className={cn('group transition-colors', s.status === 'DEACTIVATED' && 'opacity-50')}>
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center font-black text-blue-700 dark:text-blue-400 text-sm">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm">{s.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">ID: {s.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                        {s.role}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{s.phone}</div>
                      <div className="text-[10px] text-slate-400 font-bold">{s.email}</div>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {s.shift}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 px-6">
                      <Badge
                        variant={s.status === 'ACTIVE' ? 'success' : 'error'}
                        size="sm"
                        className="font-black"
                      >
                        {s.status}
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
                          onClick={() => handleDeactivate(s.id, s.status)}
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
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
        size="lg"
      >
        <form onSubmit={editingStaff ? handleUpdate : handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              placeholder="e.g. Momodou Ceesay"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+220 7XX XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {!editingStaff && (
              <>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="staff@station.gm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Temporary Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </>
            )}
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="pump_attendant">Pump Attendant</option>
                <option value="cashier">Cashier</option>
                <option value="security">Security</option>
                <option value="supervisor">Shift Supervisor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Shift Preference</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="Morning">Morning (06:00–14:00)</option>
                <option value="Evening">Evening (14:00–22:00)</option>
                <option value="Night">Night (22:00–06:00)</option>
                <option value="Flexible">Flexible / Shift Roster</option>
              </select>
            </div>
            <Input
              label="National ID Number"
              placeholder="GM-XXXXXXXX"
              value={formData.nationalId}
              onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
            />
            <Input
              label="Emergency Contact"
              placeholder="+220 7XX XXXX"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            />
          </div>
          <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex gap-3">
            <ShieldCheck className="text-blue-600 shrink-0" size={20} />
            <p className="text-xs font-medium text-blue-800 dark:text-blue-400 leading-relaxed">
              By registering this staff member, you confirm they have passed the required background check and safety training.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 py-4 font-black" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest" type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              {editingStaff ? 'Save Changes' : 'Register Staff'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
