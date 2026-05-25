'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Shield, FileText, Clock, Users, Plus, ChevronRight, Zap, MoreVertical, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { policyFunctions } from '@/supabase';

export default function PoliciesHQPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPolicy, setNewPolicy] = useState({ title: '', description: '', type: 'ALLOCATION_LIMIT' });

  const [controls, setControls] = useState([
    { id: 1, label: 'Mandatory ID Verification', active: true },
    { id: 2, label: 'Pre-shift Briefing Required', active: true },
    { id: 3, label: 'Overtime Auto-Approval', active: false },
    { id: 4, label: 'CCTV Audit Logging', active: true },
  ]);

  const toggleControl = (id: number) => {
    setControls(controls.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const loadPolicies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await policyFunctions.getPolicies({});
      setPolicies(result || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await policyFunctions.createPolicy({
        title: newPolicy.title,
        description: newPolicy.description,
        policyType: newPolicy.type,
        effectiveFrom: new Date().toISOString(),
      });
      await loadPolicies();
      setIsModalOpen(false);
      setNewPolicy({ title: '', description: '', type: 'ALLOCATION_LIMIT' });
    } catch (err: any) {
      setError(err.message || 'Policy creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const iconForType = (type: string) => {
    if (type?.includes('HOUR') || type?.includes('TIME')) return Clock;
    if (type?.includes('STAFF') || type?.includes('USER')) return Users;
    if (type?.includes('ALERT') || type?.includes('SPILL')) return AlertCircle;
    return Shield;
  };

  const colorForIndex = (i: number) => ['blue', 'purple', 'emerald', 'rose'][i % 4];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Station Policy Hub</h1>
          <p className="text-slate-500 font-medium mt-2">Define and enforce operational standards across all branches</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setIsModalOpen(true)}
          className="shadow-blue-500/20 hover:shadow-xl transition-all"
        >
          <Plus size={20} className="mr-2" strokeWidth={3} />
          Create Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-blue-500" size={22} />
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Active Station Policies</h2>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
              <AlertCircle className="text-rose-500 shrink-0" size={20} />
              <p className="text-sm font-bold text-rose-700 dark:text-rose-400">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600 text-xs font-black uppercase">Dismiss</button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : policies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 space-y-2">
              <Shield size={32} className="text-slate-300" />
              <p className="text-slate-400 font-bold text-sm">No policies yet. Create the first one.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {policies.map((p: any, i: number) => {
              const IconComponent = iconForType(p.policy_type);
              const color = colorForIndex(i);
              return (
              <Card key={p.id} className="p-8 border-none shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className={cn(
                  'p-3 rounded-2xl w-fit mb-6 transition-transform group-hover:scale-110',
                  color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' :
                  color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' :
                  color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' :
                  'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                )}>
                  <IconComponent size={24} />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight mb-2">{p.name}</h3>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">{p.description || 'No description provided.'}</p>
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <Badge variant={p.is_active ? 'success' : 'warning'} size="sm" className="font-black">{p.is_active ? 'Enforced' : 'Inactive'}</Badge>
                  <Button variant="ghost" size="sm" className="text-blue-500 font-black group text-[10px] uppercase tracking-widest p-0 hover:bg-transparent">
                    Edit <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-current opacity-[0.03] rounded-full blur-2xl" />
              </Card>
              );
            })}
          </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-0">
            <Zap className="text-amber-500" size={22} />
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Operational Toggles</h2>
          </div>
          <Card className="p-8 border-none shadow-xl space-y-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
            {controls.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => toggleControl(c.id)}
              >
                <span className={cn(
                  'text-xs font-black uppercase tracking-widest transition-colors',
                  c.active ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                )}>
                  {c.label}
                </span>
                <div className={cn(
                  'w-12 h-6 rounded-full relative transition-all duration-300 border-2 shrink-0',
                  c.active
                    ? 'bg-blue-600 border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                )}>
                  <div className={cn(
                    'absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm',
                    c.active ? 'right-1' : 'left-1'
                  )} />
                </div>
              </div>
            ))}
            <Button variant="primary" className="w-full h-14 rounded-2xl shadow-blue-500/20 font-black tracking-widest text-xs uppercase mt-4" onClick={() => alert('Station policies synchronized.')}>
              Push to All Stations
            </Button>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Station Policy"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <Input
            label="Policy Title"
            placeholder="e.g. Peak Hour Premium Rate"
            value={newPolicy.title}
            onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Policy Type</label>
              <select
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                value={newPolicy.type}
                onChange={(e) => setNewPolicy({ ...newPolicy, type: e.target.value })}
              >
                <option value="ALLOCATION_LIMIT">Allocation Limit</option>
                <option value="PRICE_CONTROL">Price Control</option>
                <option value="VEHICLE_TYPE">Vehicle Type</option>
                <option value="TIME_RESTRICTION">Time Restriction</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-black text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Policy Description</label>
            <textarea
              rows={3}
              placeholder="Describe what this policy enforces and the expected compliance..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-none"
              value={newPolicy.description}
              onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" type="button" className="flex-1 py-4" onClick={() => setIsModalOpen(false)}>Discard</Button>
            <Button variant="primary" type="submit" disabled={submitting} className="flex-1 py-4 shadow-xl shadow-blue-500/20 font-black tracking-widest">
              {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
              {submitting ? 'Publishing...' : 'Publish Policy'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
