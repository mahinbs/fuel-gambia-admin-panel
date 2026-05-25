'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Search, Users, Plus, Mail, Phone, Calendar, MoreHorizontal, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ProtectedRoute } from '@/navigation/ProtectedRoute';
import { AdminRole } from '@/types';
import { attendantFunctions } from '@/supabase';
import { useAppSelector } from '@/store/hooks';

export default function StaffBranchPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAppSelector((state: any) => state.auth || {});

  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const loadStaff = useCallback(async () => {
    if (!user?.stationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await attendantFunctions.getAttendants({ stationId: user.stationId });
      const rawStaff = result.data || [];
      const filtered = search
        ? rawStaff.filter(
            (a: any) =>
              (a.profile?.name || '').toLowerCase().includes(search.toLowerCase()) ||
              (a.profile?.email || '').toLowerCase().includes(search.toLowerCase())
          )
        : rawStaff;
      setStaff(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load staff directory');
    } finally {
      setLoading(false);
    }
  }, [user?.stationId, search]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await attendantFunctions.createAttendant({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password || undefined,
        stationId: user?.stationId,
      });
      await loadStaff();
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={AdminRole.STATION_BRANCH}>
      <div className="space-y-10 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Staff Directory</h1>
            <p className="text-slate-500 font-medium mt-2">Manage all employees assigned to this branch location</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={loadStaff} disabled={loading}>
              <RefreshCw size={18} className={cn(loading && 'animate-spin')} />
              Refresh
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              className="shadow-blue-500/20 hover:shadow-xl transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={20} className="mr-2" />
              Add Employee
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

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search staff members..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <Users size={36} className="text-slate-300" />
            <p className="text-slate-400 font-bold">No staff members found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member) => (
              <Card key={member.id} className="p-8 border-none shadow-xl group hover:shadow-2xl transition-all bg-white dark:bg-slate-900">
                <div className="flex justify-between items-start mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-xl text-slate-400">
                      {(member.profile?.name || member.id || '?').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900",
                      member.status === 'ACTIVE' ? "bg-emerald-500" : "bg-slate-300"
                    )} />
                  </div>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <MoreHorizontal size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{member.profile?.name || 'Attendant'}</h3>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{member.profile?.role || 'PUMP ATTENDANT'}</p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <Mail size={16} />
                    <span>{member.profile?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <Phone size={16} />
                    <span>{member.profile?.phone_number || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                    <Calendar size={16} />
                    <span>Joined {new Date(member.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Badge variant={member.status === 'ACTIVE' ? 'success' : 'default'} size="sm">
                    {member.status || 'ACTIVE'}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-blue-500 font-bold" onClick={() => alert('Performance tracking is coming soon.')}>
                    Performance
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Branch Employee" size="lg">
          <form className="space-y-6" onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="e.g. Lamin Sanneh"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="attendant@station.gm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                placeholder="+220 7XX XXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Temporary Password"
                type="password"
                placeholder="Auto-generated if blank"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
                The employee will receive credentials to verify their account. They will be registered as a Pump Attendant for this station.
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <Button variant="outline" type="button" className="flex-1 py-4 font-black" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={submitting} className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black">
                {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                {submitting ? 'Registering...' : 'Register Attendant'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
