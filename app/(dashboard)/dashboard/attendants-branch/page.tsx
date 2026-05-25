'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { User, UserPlus, Search, Clock, Shield, Loader2, AlertCircle, MoreHorizontal, Mail, Phone } from 'lucide-react';
import { cn } from '@/utils/cn';
import { attendantFunctions } from '@/supabase';
import { useAppSelector } from '@/store/hooks';

export default function AttendantsBranchPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendants, setAttendants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { user } = useAppSelector((state: any) => state.auth || {});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const loadAttendants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await attendantFunctions.getAttendants({ stationId: user?.stationId });
      const rawAttendants = result?.data || [];
      const filtered = search
        ? rawAttendants.filter((a: any) => (a.profile?.name || '').toLowerCase().includes(search.toLowerCase()) || (a.profile?.email || '').toLowerCase().includes(search.toLowerCase()))
        : rawAttendants;
      setAttendants(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendants');
    } finally {
      setLoading(false);
    }
  }, [user?.stationId, search]);

  useEffect(() => {
    loadAttendants();
  }, [loadAttendants]);

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
      await loadAttendants();
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to create attendant');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = attendants.filter(a => a.is_active !== false).length;
  const inactiveCount = attendants.filter(a => a.is_active === false).length;

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Pump Attendants</h1>
          <p className="text-slate-500 font-medium mt-2">Manage fuel station attendants, shifts, and verification statuses</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <UserPlus size={20} className="mr-2" strokeWidth={3} />
          Add Attendant
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
          { label: 'Total Attendants', value: loading ? '—' : String(attendants.length), icon: User, color: 'blue' },
          { label: 'Active', value: loading ? '—' : String(activeCount), icon: Shield, color: 'emerald' },
          { label: 'Inactive', value: loading ? '—' : String(inactiveCount), icon: Clock, color: 'amber' },
        ].map((stat) => (
          <Card key={stat.label} className="p-6 border-none shadow-xl relative overflow-hidden group">
            <div className={cn(
              'p-3 rounded-2xl w-fit mb-4 transition-transform group-hover:scale-110',
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
              stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' :
              'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
            )}>
              <stat.icon size={22} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Attendant Roster</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search attendants..."
              className="pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold w-48"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : attendants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3">
            <User size={36} className="text-slate-300" />
            <p className="text-slate-400 font-bold">No attendants found. Add the first one.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {attendants.map((a: any) => (
              <div key={a.id} className="flex items-center gap-5 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center font-black text-blue-700 dark:text-blue-400">
                  {(a.profile?.name || a.id || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 dark:text-white text-sm truncate">{a.profile?.name || 'Unknown'}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                    {a.profile?.email && (
                      <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Mail size={10} /> {a.profile.email}</p>
                    )}
                    {a.profile?.phone_number && (
                      <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Phone size={10} /> {a.profile.phone_number}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {a.is_verified ? (
                    <Badge variant="success" size="sm" className="font-black shrink-0">Verified</Badge>
                  ) : (
                    <Badge variant="warning" size="sm" className="font-black shrink-0">Unverified</Badge>
                  )}
                  <Badge variant={a.is_active !== false ? 'success' : 'error'} size="sm" className="font-black shrink-0">
                    {a.is_active !== false ? 'Active' : 'Inactive'}
                  </Badge>
                  <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Pump Attendant" size="lg">
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
              The attendant will receive an email to verify their account. Their account remains unverified until they first log in.
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
  );
}
